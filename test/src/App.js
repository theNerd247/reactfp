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

const rState = ({withRState}) => withRState
const rStated = (withRState) => (x) => ({withRState, ...x})

const withItems = State.nest(items)(itemmed)
const withTodoList = State.nest(todolist)(todolisted)
const withNewItemText = State.nest(newItemText)(newItemTexted)

const addNewItem = (newItemText) =>
  withTodoList( 
  withItems(
  State.modify(push(newItemText))
  ))

const askingNewItemText = State.asking(newItemText)

const showHeader = 
  Reader.bind(Reader.getting(name))
    (c(h(3), Reader.pure))

const showItems  = 
  Reader.bind(Reader.getting(items))
    (c(ullist, Reader.pure))

const reactForm = form({ onSubmit: preventingDefault })

const showNewItemInput = 
  Reader.bind(Reader.getting(newItemText))
  (nit => Reader.bind(Reader.getting(rState))
  (withRState => Reader.pure(
    textfield
      ("newItem"
      , nit
      , "new item"
      , asInputHandler(//(_, v) => withRState(State.modify(newItemTexted(v)))
          (n) => c(newItemTexted, State.modify, withRState)
        )
      )
  )))

const showNewItemForm = 
  Reader.pure(
    reactForm(
      JSX.mconcat
        ( showNewItemInput
        , submit("+")
        )
    )
  )

const showHomePage = 
      apn(Reader.ap)
        ( JSX.mconcat
        ( Reader.nest(todolist)(showHeader(n))
        , (showNewItemForm)
        , Reader.nest(todolist)(showItems(l))
        )
      )
    ))

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

  render = () => Reader.runReaderWith(rStated(this.state))(showHomePage)
}

export default App;
