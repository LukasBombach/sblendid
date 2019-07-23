import MyQueue from "../src/queue";

const myQueue = new MyQueue();

(async () => {
  const valDelayed = myQueue.add(() => new Promise(res => setTimeout(() => res("deleayed"), 0)));
  const val = await myQueue.add(() => Promise.resolve("hello"));
  const val2 = await myQueue.add(() => Promise.resolve("hello 2"));

  // console.log(valDelayed);
  valDelayed.then(val => console.log(val));

  console.log("val", val);
  console.log("val2", val2);

  console.log(myQueue.end());
})();
