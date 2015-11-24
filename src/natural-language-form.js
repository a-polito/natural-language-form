(function(angular) {
	/**
		<natural-language-form>
			<div>Cerco una Residenza Universitaria di tipo <nlSelect bind="search.tipo" options="tipi"></nlSelect> in <nlSelect bind="search.provincia"></nlSelect> 
			correlata a <nlText bind="search.universitaCorrelata"></nlText> e frequentata da  <nlSelect bind="search/.tipo"></nlSelect>
			</div>
		</natural-language-form>
	*/
	angular
	.module('ap-naturalLanguageForm', [])
	.controller('MainCtrl', ['$scope', function($scope) {
		$scope.search = {}
	}])
	.directive('nlForm',[function(){

	    return {
	        restrict:'E',
	        transclude : true,
	        templateUrl : 'src/nl-form.html',
	        scope : {
	        	searchTrigger : "&",
				themeSelector : "@"
	        },
	        link : function($scope, elem, attrs) {
	        	$scope.themeSelector = $scope.themeSelector || 'default';
	        }
	    }

	}])
	.controller('nlSelectController',['$scope', '$filter', '$element' 
		, function(scope, $filter, $element){
		
		this.createSelectOptions = function(boundOptions, selected, defaultOpts) {
			var selectOpts = []
			var selIndex = -1;
			if(defaultOpts) {
				this.defaultOpts = defaultOpts
			}
			var defaults = this.defaultOpts;

			if(defaults && angular.isArray(defaults)) {
				angular.forEach(defaults, function(item) {
					selectOpts.push({
						value : item.value,
						label : item.label
					})
				})
			}

			if(boundOptions && angular.isArray(boundOptions)) {
				angular.forEach(boundOptions, function(opt) {
					selectOpts.push({
						value : opt.value,
						label : opt.label
					})
				})
			}

			this.selectOptions = $filter('filter')(selectOpts, { label : this.selectFilter})

			if(selected && this.selectOptions.length > 0) {
				selIndex = this.setSelected(this.selectOptions, selected)
			}

			if(selIndex === -1 && this.selectOptions.length > 0) {
				selIndex = this.setSelected(this.selectOptions, 0);
			}
		}

		this.setSelected = function(options, selIndexOrValue) {
			var selectedIndex = -1;
			
			if(angular.isNumber(selIndexOrValue) && (selIndexOrValue < 0 || selIndexOrValue >= options.length)) {
				return selectedIndex;
			}

			angular.forEach(options, angular.bind(this, function(item, currIndex) {
				if(
					(angular.isNumber(selIndexOrValue) && currIndex === selIndexOrValue) ||
					(angular.isString(selIndexOrValue) && item.value === selIndexOrValue)
				) {
					item.selected = true
					//scope.selectedValue = item
					//scope.ngModel = options[currIndex].value
					this.selectedIndex = selectedIndex = currIndex
					scope.$broadcast('nlSelect-selected', currIndex, this.selectOptions)
				} else {
					item.selected = false
				}
			}))

			return selectedIndex;
		}

		this.keyDownHandler = function(event) {
			if(event.keyCode===40) { //down key, increment selectedIndex
				event.preventDefault()
				if(!scope.open) {
					scope.open = true
				} else {
					this.setSelected(this.selectOptions, this.selectedIndex+1)
				}

			} else if(event.keyCode===38) { //up key, decrement selectedIndex
				event.preventDefault()
				if(!scope.open) {
					scope.open = true
				} else {
					this.setSelected(this.selectOptions, this.selectedIndex-1)
				}

			} else if(event.keyCode===36) { //home key, selectedIndex = 0
				event.preventDefault();
				this.setSelected(this.selectOptions, 0)

			} else if(event.keyCode===35) { //end key, selectedIndex = suggestions.length - 1
				event.preventDefault();
				this.setSelected(this.selectOptions, this.selectOptions.length - 1)

			} else if(event.keyCode===13 || event.keyCode===9 || event.keyCode===27 ) { //enter or tab or esc pressed
				scope.open = false;

			} else {//if any other key focus on input to enable writing with automcomplete

			}
		}
	}])
	.directive('nlSelect', ['$timeout', function($timeout) {
		var initBodyClickHandlers =  function(scope, element, optsContainer) {
			var handler = function(clickEvent) {

				if(clickEvent.target !== getSelectedValueNode(element)[0] && 
					!$(clickEvent.target).parents().is(optsContainer)) {
					scope.$apply(function() {
						scope.open = false
					})
				}
			}

			$(document.body).bind('click', handler);

			scope.$on('$destroy', function() {
				$(document.body).unbind('click', handler)
				optsContainer.remove();
			})
		}

		var initWatchers = function(scope, controller, element) {
			var selValueSpanNode = getSelectedValueNode(element)
			var optsContainer = getOptionsContainer(element);
			var selValueHeight = selValueSpanNode.outerHeight();

			scope.$watch("options", function() {
				controller.createSelectOptions(scope.options, scope.ngModel)
			})

			scope.$watch("open", function(value) {
				if(value === true) {
					scope.$broadcast('nlSelect-open', controller, element, optsContainer);

				} else if(value === false) {
					scope.$broadcast('nlSelect-close', controller, element, optsContainer);

				}
			});
		}

		var initEventHandlers = function(scope) {
			scope.$on('nlSelect-open', onOpen);
			scope.$on('nlSelect-close', onClose);
			scope.$on('nlSelect-select', onSelect)
		}

		var getInputText = function(optsContainer) {
			return optsContainer.find("input")
		}
		var getSelectedValueNode = function(container) {
			return container.find("a.nlSelect-selected-value")
		}

		var getOptionsContainer = function(rootElement) {
			return rootElement.find('.nlSelect-options-container')
		}

		var onOpen = function(scope, controller, element, optsContainer) {
			var selValueNode = getSelectedValueNode(element)
			var top = element.offset().top + selValueNode.outerHeight()
			var left = element.offset().left
			optsContainer.css('top', top)
			optsContainer.css('left', left)

			$timeout(function() {
				getInputText(optsContainer).focus()
			}, 1)
		}

		var onClose = function(event, controller) {
			var scope = event.currentScope;
			controller.selectFilter = ''
			scope.selectedValue = controller.selectOptions[controller.selectedIndex]
			scope.ngModel = scope.selectedValue.value
			controller.createSelectOptions(scope.options, scope.ngModel)

		}

		var onSelect = function(scope, controller, element, optsContainer) {
			
		}

		return {
			restrict : 'E',
			templateUrl : 'src/nl-select.html',
			controller : 'nlSelectController',
			controllerAs : 'selectCtrl',
			scope : {
				ngModel : "=",
				options : "=?",
				themeSelctor : "@",
				tabIndex : "@",
				autocompletable : "@"
			},
			transclude : true,
			link: function(scope, element, attrs, controller, transcludeFn) {

				scope.tabIndex = scope.tabIndex || 0;
				scope.selectAnyLabel = attrs.selectAnyLabel
				scope.themeSelector = attrs.themeSelector ? attrs.themeSelector : "default"
				scope.options = scope.options ? scope.options : []

				var htmlOpts = []
				transcludeFn(scope, function(clone, scope) {
					angular.forEach(clone, function(item, index) {
						if(item.nodeName && item.nodeName.toUpperCase() === 'NL-OPTION') {
							htmlOpts.push({
								label : item.textContent,
								value : (item.attributes['value'] ? item.attributes['value'] : item.textContent)
							})
						}
					})
				})
				controller.createSelectOptions(scope.options, scope.ngModel, htmlOpts)
				
				var optsContainer = getOptionsContainer(element);
				scope.select = function(selected, $event) {
					controller.setSelected(controller.selectOptions, selected.value)
					scope.open = false
				}

				scope.openDropDown = function($event) {
					scope.open = true
				}
				
				scope.keyDownHandler = function($event) {
					controller.keyDownHandler($event)
					if(!scope.open) {
						getSelectedValueNode(element).focus()
					}
				}

				scope.handleFilterChange = function($event) {
					controller.createSelectOptions(scope.options, scope.ngModel)
				}

				initBodyClickHandlers(scope, element, optsContainer)
				initWatchers(scope, controller, element)
				initEventHandlers(scope);

				$(document.body).append(optsContainer);

				scope.$on('nlSelect-selected', function() {
					$timeout(function() {
						var htmlList = optsContainer.find("ul");
						var inputHeight = getInputText(optsContainer).outerHeight();
						var selectedElement = htmlList.find(".selected");

						if(selectedElement && selectedElement.length > 0 
						&& (htmlList.offset().top + htmlList.outerHeight() < selectedElement.offset().top + selectedElement.outerHeight()
						)) {
							htmlList.scrollTop(htmlList.scrollTop() + selectedElement.position().top);
						} else if(selectedElement && selectedElement.length > 0
						&& selectedElement.position().top < 0) {
							htmlList.scrollTop(htmlList.scrollTop() + selectedElement.position().top);
						}

					}, 1)
				})
			}
		}
	}])
	.directive('nlText', [function() {
		return {
			restrict : 'E',
			templateUrl : 'src/nl-text.html',
			controller : 'nlTextController',
			controllerAs : "ctrl",
			scope : {
				ngModel : "=",
				placeholder : "@",
				themeSelector : "@",
				tabIndex : "@"
			}
		}
	}])
	.controller('nlTextController', ['$scope', '$element', '$timeout', function($scope, $element, $timeout){

		$scope.ngModel = $scope.ngModel && $scope.ngModel.length > 0 ? $scope.ngModel : $scope.placeholder
		$scope.tabIndex = $scope.tabIndex || 0

		this.switchEditing = function(enable) {
			$scope.editing = enable
			$timeout(function() {
				$element.find('input[type=text]').focus()
			}, 1)
		}

		this.handleKeyEvent = function($event) {
			if($event && ($event.keyCode === 13 || $event.keyCode === 27)) {//on press enter or ESC 
				$scope.editing = false;
			}
		}
	}]);

})(angular)