export const id        = (x)                       => x
export const asConst   = (a)     => (b)            => a
export const withConst = (x)     => (f)            => f(x)
export const c         = (...fs)           => (x)  => fs.reduce((v, f) => f(v), x)
export const flip      = (f)     => (a)    => (b)  => f(a)(b)
export const fst       = (x)                       => x[0]
export const snd       = (x)                       => x[1]
export const pair      = (a,b)                     => [a,b]
export const curry     = (f)     => (a)    => (b)  => f(a, b)
export const uncurry   = (f)     => (a, b)         => f(a)(b)
export const curryp    = (f)     => (a)    => (b)  => f(pair(a,b))
export const uncurryp  = (f)     => (p)            => f(fst(p))(snd(p))
export const apn       = (ap)    => (f) => (...xs) => xs.reduce((g, x) => ap(g)(x), f)

export const Pair =
  { fmap : (f) => (p) => pair(f(fst(p)), snd(p))
  , bimap: (f) => (g) => (p) => pair(f(fst(p)), g(snd(p)))
  , gmap : (f) => (p) => pair(fst(p), f(snd(p)))
  }

export const List =
  { foldr : (f) => (r)  => (xs) => xs.reduce(f, r)
  , fmap  : (f) => (xs) => xs.map(f)
  }

//Reader r a ~ (r -> a)
export const Reader =
  { runReader     : id
  , runReaderWith : withConst
  , fmap          : (f) => (r) => c(r,f)
  , bimap         : (f) => (g) => (r) => c(f, r, g)
  , pure          : asConst
  , ap            : (f) => (r) => (x) => f(x)(r(x))
  , bind          : (a) => (f) => c(a, f)
  , get           : () => id
  }

//State s a ~ (s -> (a, s))
export const State =
  { runState     : id
  , runStateWith : withConst
  , fmap         : (f) => (s) => c(s, Pair.fmap(f))
  , bimap        : (f) => (g) => (s) => c(s, Pair.bimap(f)(g))
  , pure         : (x) => (s) => pair(x, s)
  , ap           : (sf) => (s) => c(sf, Reader.ap(c(fst, Pair.fmap))(c(snd, s)))
  , bind         : (a) => (f) => c(a, uncurryp(f))
  //set :: s -> State s ()
  : set          : (a) => asConst(pair((), a))
  //ask :: State s s
  , ask          : (s) => pair(s, s) 
  //asking :: (s -> a) -> State s a
  , asking       : (f) => State.fmap(f)(State.ask)
  //modify :: (s -> t) -> State t ()
  , modify       : (f) => State.bind(State.asking(f))(State.set)
  //nest :: (b -> a) -> (a -> b -> b) -> State a x -> State c x
  , nest         : (f) => (g) => (sa) => 
      State.bind
        (State.asking(f))
        (c( runState(sa)
          , Reader.runReader( ) 
          )
        )
  }

//Coreader s a ~ (a, s)
export const Writer = (m) =>
  { runCoreader : apply
  , runCoreader : withConst
  , fmap : Pair.fmap
  , pure : (x) => pair(x, m.empty)
  , ap   : (fw) => (r) => withConst (Pair.fmap(fst(fw))(r)) (gmap(m.append(snd(fw))))
  , bind : (a) => (f) => withConst(f(fst(a)))(Pair.gmap(m.append(snd(a))))
  , tell : (w) => pair((), w)
  }

export const Monoid = (f, m) => 
  { mconcat = f.foldr m.append m.mempty
  }

const plus = (a) => (b) => a + b

console.log
  ( Reader.runReaderWith(7)
    ( apn(Reader.ap)
      ( Reader.pure(plus))
      ( Reader.pure(1)
      , Reader.pure(2)
      )
    )
  )

console.log(
  State.runStateWith(7)
  ( apn(State.ap)
    ( State.pure(plus))
    ( State.pure(1)
    , State.pure(2)
    )
  )
)

console.log(
  State.runStateWith(7)
    ( State.bimap
        (plus(1))
        (plus(8))
        (State.pure(3))
    )
)
