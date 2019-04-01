## Setup
Node, NPM, and webpack are all required.
1. `npm install`
2. `npm i -g webpack`
3. `npm i -g webpack-cli`

## Running
1. Run: `webpack --watch`
2. Open the "dist" folder, and open "UsingObservables.html"

## Solving
From the "UserSolutions.ts" file you will find all of the challenges.
Start by checking out the ExampleEcho challenge. This solution serves as an example of a solution.
Take note of the `RunAll()` method located near the end of the file. Here you can select which tests to run.

## FAQ
Q: Why are the tests themselves `Observable<boolean>` instead of just `boolean`?
A: Some of the tests have timed components, thus making the test itself async.

Q: What if I mess up a test and it waits forever?!
A: So long as you are within the observable pipeline that is ok, as each test has a timeout.

Q: What if I mess up a test and it goes into an infinite loop?!
A: Close your tab and start over, because well, Javascript.

Q: Where are the source maps?
A: Inlined. Issue with Chrome and loading from local FS.

Q: Do I need to have the console open?
A: Ehhh, probably not? All output goes to the page. However if you need to view a stacktrace or an objects innards you will need the console. Oh and maybe for disabling the Cache in the network tab.

Q: How are my solutions tested?
A: Good question! All solutions are checked against my solutions to the problems.
How this is accomplished is *only* checking the output of my stream vs yours. The exact flow and what operators you use are not checked, only the final results.

Q: Sometimes you ask to throw exceptions, won't that kill the pipeline?
A: For that test invocation yes, however the test manager is expecting an exception at those points, and deals with it accordingly.

Q: I wanted to see how you did it. But your file makes no sense! What did you do to it.
A: A little manual obfuscation. Nothing a few scrolls up and down can't decode, but I didn't want to just give it away that easiliy!

Q: Ok I need help, what should I do?
A: Start by visiting the test itself in `UsingObservables.ts`. There you can see all of the data used in the test.
If you need additional help locate the `ko`(known observable) for each test, and mouse over it, a list of hints will be provided.

Q: Wait if I can see the data, and I know what to do but can't figure out how to implement it, can't I cheat and just return the expected data?
A: Cheeky cheeky. Yes, and no. Some tests have random generators built in.

Q: Where can I go for documentation on RxJs?
A: https://www.learnrxjs.io/operators/ is a good starting point

Q: Is pipeline operations all we are going to be doing?
A: For now yes. In the future I may consider creating challenges that have you create cold observables, custom operators, and statefull wrappers.

Q: This TSLINT file suuuuuux.
A: Ha, I actually made it quite leinent, but you can disabled it on your local machine if you want. I ain't gonna stop you.
