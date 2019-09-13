const asConst   = (a)     => (b)           => a
const withConst = (x)     => (f)           => f(x)
const c         = (...fs)           => (x) => fs.reduce((v, f) => f(v), x)
const apply       = (f)     => (x)           => f(x)
const flip      = (f)     => (a)    => (b) => f(a)(b)
const fst       = (x)                      => x[0]
const snd       = (x)                      => x[1]
const pair      = (a,b)                    => [a,b]
const curry     = (f)     => (a)    => (b) => f(a, b)
const uncurry   = (f)     => (a, b)        => f(a)(b)
const apn       = (ap)    => (f) => (...xs) => xs.reduce((g, x) => ap(g)(x), f)

const Pair =
  { fmap : (f) => (p) => pair(f(fst(p)), snd(p))
  , bimap: (f) => (g) => (p) => pair(f(fst(p)), g(snd(p)))
  , gmap : (f) => (p) => pair(fst(p), f(snd(p)))
  }

const List =
  { foldr : (f) => (r)  => (xs) => xs.reduce(f, r)
  , fmap  : (f) => (xs) => xs.map(f)
  }

//Reader r a ~ (r -> a)
const Reader =
  { runReader     : apply
  , runReaderWith : withConst
  , fmap          : (f) => (r) => c(r,f)
  , bimap         : (f) => (g) => (r) => c(f, r, g)
  , pure          : asConst
                //(r -> (a -> b)) -> (r -> a) -> (r -> b)
  , ap            : (f) => (r) => (x) => f(x)(r(x))
  , ret           : pure
  , bind          : (a) => (f) => c(a, f)
  }

//State s a ~ (s -> (s, a))
const State =
  { runState     : apply
  , runStateWith : withConst
  , fmap         : (f) => (s) => c(s, Pair.fmap(f))
  , bimap        : (f) => (g) => (s) => c(s, Pair.bimap(f)(g))
  , pure         : (x) => (s) => pair(x, s)
  , ap           : (sf) => (s) => c(sf, Reader.ap(c(fst, Pair.fmap))(c(snd, s)))
  }

//Coreader s a ~ (a, s)
const Writer = (m) =>
  { runCoreader : apply
  , runCoreader : withConst
  , fmap : Pair.fmap
  , pure : (x) => pair(x, m.empty)
  , ap   : (fw) => (r) => withConst (Pair.fmap(fst(fw))(r)) (gmap(m.plus(snd(fw))))
  }

const Monoid = (f, m) => 
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
