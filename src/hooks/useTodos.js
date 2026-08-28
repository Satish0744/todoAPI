import { useState, useEffect, useCallback } from 'react';
import { todoApi } from '../api/todoApi';

export const useTodos = () => {
  const [todos, setTodos] = useState([]);
  const [filteredTodos, setFilteredTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await todoApi.getTodos();
      setTodos(data);
      setFilteredTodos(data);
    } catch (err) {
      setError('Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTodo = useCallback(async (todoData) => {
    setLoading(true);
    try {
      const newTodo = await todoApi.createTodo(todoData);
      setTodos(prev => [newTodo, ...prev]);
      return newTodo;
    } catch (err) {
      setError('Failed to create todo');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTodo = useCallback(async (id, todoData) => {
    setLoading(true);
    try {
      const updated = await todoApi.updateTodo(id, todoData);
      setTodos(prev => prev.map(todo => todo.id === id ? { ...todo, ...updated } : todo));
      return updated;
    } catch (err) {
      setError('Failed to update todo');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleTodoStatus = useCallback(async (id, completed) => {
    setLoading(true);
    try {
      const updated = await todoApi.patchTodo(id, { completed });
      setTodos(prev => prev.map(todo => 
        todo.id === id ? { ...todo, completed: updated.completed } : todo
      ));
      return updated;
    } catch (err) {
      setError('Failed to update status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTodo = useCallback(async (id) => {
    setLoading(true);
    try {
      await todoApi.deleteTodo(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch (err) {
      setError('Failed to delete todo');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let result = todos;
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      result = result.filter(todo => 
        todo.title.toLowerCase().includes(searchLower)
      );
    }
    if (filterStatus === 'completed') {
      result = result.filter(todo => todo.completed);
    } else if (filterStatus === 'pending') {
      result = result.filter(todo => !todo.completed);
    }
    setFilteredTodos(result);
  }, [todos, searchTerm, filterStatus]);

  return {
    todos: filteredTodos,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    fetchTodos,
    createTodo,
    updateTodo,
    toggleTodoStatus,
    deleteTodo
  };
};

export default useTodos;