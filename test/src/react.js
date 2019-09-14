import React from 'react'
import { State, c, mapped, id, Monoid } from './reader.js'

export const JSX = Monoid(
  { append : (a) => (b) => { return (<>{a}{b}</>) }
  , empty  : null
  , pure   : (a) => { return (<>{a}</>) }
  }
)

//JSX -> JSX
export const elem = (t) => (a) => (c) => React.createElement(t, a, c) 

export const tag = (a) => elem(a)([])

export const h   = (n) => tag(`h${n}`)
export const p   = tag('p')
export const div = tag('div')
export const ul  = tag('ul')
export const li  = tag('li')
export const form = elem('form')
export const input = (a) => elem('input')(a)(JSX.empty)
export const submit = (value) => input(
  { type : "submit"
  , value
  }
)
export const textfield = (name, value, placeholder, onChange ) => input(
  { type : "text"
  , value
  , name
  , onChange
  , placeholder
  }
)

export const ullist = c(mapped(li), ul)

export const asInputHandler = (f) => (evnt) => f(evnt.target.name)(evnt.target.value)

export const preventingDefaultWith = (f) => (evnt) => (evnt.preventDefault(), f(evnt))

export const preventingDefault = preventingDefaultWith(id)

/*
module.exports =
  { JSX
  , elem
  , tag
  , p  
  , div
  , h1 
  , ul 
  , li 
  }
*/
