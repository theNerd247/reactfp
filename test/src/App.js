import React from 'react';
import logo from './logo.svg';
import './App.css';

import 
  { withConst
  , push
  , c
  , fst
  , snd
  , Reader
  , State 
  , apn
  } from './reader.js'

import 
  { JSX
  , h
  , p
  , ullist 
  , form
  , textfield
  , submit
  , preventingDefault
  , asInputHandler
  } from './react.js';

const items = ({items}) => items || []
const itemmed = (items) => (x) => ({items, ...x})

const name = ({name}) => name || ""
const named = (name) => (x) => ({name, ...x})

const todolist = ({todolist}) => todolist
const todolisted = (todolist) => (x) => ({todolist, ...x})

const newItemText = ({newItemText}) => newItemText || ""
const newItemTexted = (newItemText) => (x) => ({newItemText, ...x})

const withItems = State.nest(items)(itemmed)
const withTodoList = State.nest(todolist)(todolisted)
const withNewItemText = State.nest(newItemText)(newItemTexted)

const addNewItem = (newItemText) =>
  withTodoList( 
  withItems(
  State.modify(push(newItemText))
  ))


const askingNewItemText = State.asking(newItemText)

const modifyNewItemText = c(newItemTexted, State.modify)

const showHeader = c(name, h(3))
const showItems  = c(items, ullist)

const showTodoList = 
  apn(Reader.ap)
    (JSX.append)
    (showHeader, showItems)

const reactForm = form({ onSubmit: preventingDefault })

const newItemInput = (withRState) => textfield
  ("newItem"
  , withRState(State.asking(newItemText))
  , "new item"
  , asInputHandler((_, v) => withRState(modifyNewItemText(v)))
  )

const newItemForm = (withRState) => reactForm(
  JSX.mconcat
    ( newItemInput(withRState)
    , submit("+")
    )
)

const homePage =
  Reader.fmap
    (JSX.append(h(1)("my lists")))
    (c(todolist, showTodoList))

class App extends React.Component
{
  state = 
    { todolist: 
        { name: "foo"
        , items: 
            [ "asdf"
            , "basdf"
            , "cadsf"
            ]
        }
    }

  withReactState = (s) => withConst(s(this.state))(x => (this.setState(snd(x)), fst(x)))

  render = () => homePage(this.state)
}

export default App;
