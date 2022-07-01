import {
  useQuery,
  useMutation,
  QueryClient,
  QueryClientProvider,
} from 'react-query';

const queryClient = new QueryClient();

const todos = [
  { id: 1, title: "title 1", completed: false }
];

const isTrueOrFalse = () => {
  const number = Math.round(Math.random());

  return number === 0 ? false : true;
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Todos />
    </QueryClientProvider>
  );
}

const Todos = () => {
  //Setting todos
  const { isLoading, error, data } = useQuery("todos", () => {
    return todos;
  }, {
    select: data => data.sort((a, b) => b.id - a.id)
  })

  //Adding todos
  const addTodoMutation = useMutation(todo => {
    return todo;
  }, {
    onMutate: (todo) => {
      queryClient.cancelQueries('todos');

      const todos = queryClient.getQueryData('todos');

      queryClient.setQueryData('todos', [...todos, todo]);

      return todos;
    },
  })

  //Updating completed value on a certain todo
  const updateTodoMutation = useMutation(id => {
    return id;
  }, {
    onMutate: (id) => {
      queryClient.cancelQueries('todos');

      const todos = queryClient.getQueryData('todos');

      const newTodos = todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo);

      queryClient.setQueryData('todos', newTodos);

      return todos;
    },
  })

  //Deleting a todo
  const deleteTodoMutation = useMutation(id => {
    return id;
  }, {
    onMutate: (id) => {
      queryClient.cancelQueries('todos');

      const todos = queryClient.getQueryData('todos');

      const newTodos = todos.filter(todo => todo.id !== id);

      queryClient.setQueryData('todos', newTodos);

      return todos;
    },
  })

  //Adding new todo
  const handleTodo = (e) => {
    if (e.key === "Enter" && e.target.value !== '') {
      const randomNumber = Math.floor(Math.random() * 1000);

      addTodoMutation.mutate({
        id: randomNumber,
        title: `${e.target.value} ${randomNumber}`,
        completed: isTrueOrFalse()
      })

      e.target.value = '';
    }
  }

  if (isLoading) {
    return (
      <div>Loading...</div>
    )
  }

  if (error) {
    return (
      <div>{error.message}</div>
    )
  }

  const uncompletedTodosLength = (
    queryClient.getQueryData("todos")
      ? queryClient.getQueryData("todos")?.filter(todo => todo.completed === false)?.length
      : 0
  )

  return (
    <div className="mt-20 border-2 mx-auto w-4/5">
      <h1 className="mb-5 text-3xl text-center">Todos({uncompletedTodosLength})</h1>

      {/* Create Todo */}
      <input
        onKeyDown={e => handleTodo(e)}
        className="mb-20 p-5 w-full bg-gray-800 rounded text-white placeholder:text-white"
        placeholder='Add Todo...'
      />

      {/* Display Todos */}
      {data.map(todo => (
        <div key={todo.id} className="relative mb-20 p-5 w-full rounded bg-gray-900 text-white">
          <button
            onClick={() => deleteTodoMutation.mutate(todo.id)}
            className="absolute top-1 right-1"
          >
            delete
          </button>
          <p>{todo.title}</p>
          <button
            onClick={() => updateTodoMutation.mutate(todo.id)}
            className={todo.completed ? 'line-through' : 'no-underline'}
          >
            {todo.completed ? 'completed' : 'uncompleted'}
          </button>
        </div>
      ))}
    </div>
  )
}

export default App;