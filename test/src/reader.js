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
export const foldr     = (f)     => (x0)   => (xs) => xs.reduce(uncurry(f), x0)
export const apn       = (ap)    => (f) => (...xs) => xs.reduce((g, x) => ap(g)(x), f)
export const mapped    = (f)     => (xs)           => xs.map(f)
export const trace     = (x)                       => (console.log(x), x)
export const isEmpty   = (x)                       => x == null || x == undefined
export const push      = (x)     => (xs)           => isEmpty(xs) ? [x] : (xs.push(x), xs)
export const nill      =                              {}

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
  , get           : id
  , getting       : id
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
  , set          : (a) => asConst(pair(nill, a))
  , ask          : (s) => pair(s, s) 
  , asking       : (f) => State.fmap(f)(State.ask)
  , modify       : (f) => State.bind(State.asking(f))(State.set)
  , nest         : (f) => (g) => (sa) => 
      State.bind
        (State.asking(f))
        (c( State.runState(sa)
          , ([x,a]) => (State.modify(g(a)), State.pure(x))
          )
        )
  }

//Coreader s a ~ (a, s)
export const Writer = (m) =>
  ({ runWriter : id
  , fmap : Pair.fmap
  , pure : (x) => pair(x, m.empty)
  , ap   : (fw) => (r) => withConst (Pair.fmap(fst(fw))(r)) (Pair.gmap(m.append(snd(fw))))
  , bind : (a) => (f) => withConst(f(fst(a)))(Pair.gmap(m.append(snd(a))))
  , tell : (w) => pair(nill, w)
  })

export const Monoid = (m) => (
  { mconcat : (...ms) => foldr(m.append)(m.mempty)(ms)
  , ...m
  }
)

export const plus = (a) => (b) => a + b

/*
module.exports = 
  { id       
  , asConst    
  , withConst
  , c        
  , flip     
  , fst      
  , snd      
  , pair     
  , curry    
  , uncurry  
  , curryp   
  , uncurryp 
  , apn      
  , nill     
  , Pair
  , List
  , Reader
  , State
  , Writer
  , Monoid
  }
  */
