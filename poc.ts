class Person {
  name: string;
  age: number;
  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
  sayHello() {
    console.log(`Hello, my name is ${this.name}, I am ${this.age} years old.`);
  }
}

new Person("John", 30).sayHello();

fetch(new URL("./main.ts", import.meta.url).href).then((res) => res.text())
  .then((text) => console.log(text));
