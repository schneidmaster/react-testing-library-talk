import React, { useCallback, useEffect, useState } from "react";
import AddTodo from "./AddTodo";
import Todo from "./Todo";
import { getJSON } from "./api";

export default function TodoList() {
  const [loaded, setLoaded] = useState(false);
  const [todos, setTodos] = useState(false);
  const [users, setUsers] = useState(false);

  const addTodo = useCallback((newTodo) => {
    setTodos([...todos, newTodo]);
  });

  const updateTodo = useCallback((updatedTodo) => {
    const todoIdx = todos.findIndex((todo) => todo.id === updatedTodo.id);
    const newTodos = [todos];
    newTodos[todoIdx] = updatedTodo;
    setTodos(newTodos);
  });

  useEffect(() => {
    Promise.all([getJSON("/todos"), getJSON("/users")]).then(
      ([todos, users]) => {
        setTodos(todos);
        setUsers(users);
        setLoaded(true);
      }
    );
  }, []);

  if (!loaded) {
    return <p>Loading...</p>;
  } else {
    return (
      <>
        {todos.map((todo) => (
          <Todo
            key={todo.id}
            todo={todo}
            users={users}
            updateTodo={updateTodo}
          />
        ))}

        <AddTodo users={users} addTodo={addTodo} />
      </>
    );
  }
}
