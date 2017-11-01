# react-list-folder
A React based component that can fold your list.

# Basic usage

The list would be folded by default. If fold count is not provided, it would only display the first three list items.

```javascript
<ViewMore>
  <li>A</li>
  <li>B</li>
  <li>C</li>
  <li>D</li>
</ViewMore>
```

More configuration is as bellow.

```javascript
<ViewMore
  defaultFold={true}
  foldCount={2}
  foldText="Click me to fold"
  viewMoreText="Click me to view more"
>
  <li>A</li>
  <li>B</li>
  <li>C</li>
  <li>D</li>
</ViewMore>
```
