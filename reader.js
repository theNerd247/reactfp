const asConst   = (a)     => (b)           => a
const withConst = (x)     => (f)           => f(x)
const c         = (...fs)           => (x) => fs.reduce((v, f) => f(v), x)
const app       = (f)     => (x)           => f(x)
const flip      = (f)     => (a)    => (b) => f(a)(b)
const first     = (x)                      => x[0]
const second    = (x)                      => x[2]
const pair      = (a,b)                    => [a,b] 
const curry     = (f)     => (a)    => (b) => f(a, b)
const uncurry   = (f)     => (a, b)        => f(a)(b)

const Pair =
  { fmap : (f) => (p) => pair(f(first(p)), second(p))
  , bimap: (f) => (g) => pair(f(first(p)), g(second(p)))
  }

const List =
  { foldr : (f) => (r)  => (xs) => xs.reduce(f, r)
  , fmap  : (f) => (xs) => xs.map(f)
  }

//Reader r a ~ (r -> a)
const Reader =
  { runReader     : app
  , runReaderWith : withConst
  , contramap     : (f) => (r) => c(f,r)
  , bimap         : (f) => (g) => (r) => c(f, r, g)
  , pure          : asConst
  //ap :: (r -> (a -> b)) -> (r -> a) -> (r -> b)
  , ap            : (rf) => (r) => (x) => rf(x)(r(x))
  }

//State s a ~ (s -> (s, a))
const State =
  { runState     : app
  , runStateWith : withConst
  , fmap         : (f) => (s) => c(s, Pair.fmap(f))
  , pure         : (x) => (s) => pair(x, s)
  , ap           : (sf) => (s) => c(sf, Reader.bimap(c(first, Pair.fmap), c(second, s)))
  }

/*
 
Component a :: a -> JSX

Component a -> Component b -> Component c
f :: c -> a 
g :: c -> b

*/
