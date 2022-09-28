# Useless template engine, just for the purpose of understanding how the template engine works.

## How to use

```js
// in js file

import View from './core/View.js'

const v = new View()

v.render('profile.html', {
  name: 'Jhon',
  age: 30,
  address {
    street: "Jhon`s Street",
    number: 987
  },
  skills: ['html', 'css', 'js']
})
```

```html
<!-- in views/profile.html -->

<h1> My name is: <& this.name &> </h1>
<h2> I Have <& this.age &> yo </h2>
<p> My address is: <& this.addres.street &>, <& this.addres.number &> <p/>

<& for (var index in this.skills) { &>
  <p> My skills is: <& this.skills[index] &> </p>
<& } &>
```
