# natural-language-form
I was tired to see in every website the same old forms with same old labels with same old search fields, and after surfing the web I bumped myself into the beatiful works of Codrops (http://tympanus.net/codrops/) and their experimental implementation of a natural form language (https://github.com/codrops/NaturalLanguageForm). 
When we had the chance to freely make proposals on our project, we decided to get it into and reimplement the whole concept using AngularJS.

The main idea beside this component is to express a search sentence with a meaningful phrase. If you does not have the power of a semantic search engine, or fixed predetermined fields this can be a good way to address the UI development in an elegant way.

# nl-form
The container nl-form provides capabilities like tab indexing, theming and search trigger buttons.
```sh
<nl-form>
	... contents ...
</nl-form>
```
# nl-select
The canonical selectbox is replaced by nl-select. It offers capabilities like keyboard navigation, autocompletion, multiselection, theming. Options can be specified by binding the "options" attribute or by hardcoding them into the component
```sh
<nl-select options="boundedArray" automcompletable="true">
	<nl-option>value</nl-option>
	<nl-option value="otherValue">otherLabel</nl-option>
</nl-select>
```

# nl-select
The canonical selectbox is replaced by nl-select. It offers capabilities like keyboard navigation, autocompletion, multiselection, theming