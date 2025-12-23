import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

interface TodoState {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
  searchTerm: string;
  isLoading: boolean;
}

const initialState: TodoState = {
  todos: [],
  filter: 'all',
  searchTerm: '',
  isLoading: false,
};

export const TodoStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed(({ todos, filter, searchTerm }) => ({
    filteredTodos: computed(() => {
      let result = todos();
      
      // Filter by search term
      if (searchTerm()) {
        result = result.filter(todo => 
          todo.title.toLowerCase().includes(searchTerm().toLowerCase())
        );
      }
      
      // Filter by status
      if (filter() === 'active') {
        return result.filter(todo => !todo.completed);
      } else if (filter() === 'completed') {
        return result.filter(todo => todo.completed);
      }
      
      return result;
    }),
    
    totalCount: computed(() => todos().length),
    activeCount: computed(() => todos().filter(t => !t.completed).length),
    completedCount: computed(() => todos().filter(t => t.completed).length),
  })),

  withMethods((store) => ({
    addTodo(title: string): void {
      const newTodo: Todo = {
        id: Date.now(),
        title,
        completed: false,
      };
      patchState(store, { todos: [...store.todos(), newTodo] });
    },

    toggleTodo(id: number): void {
      patchState(store, {
        todos: store.todos().map(todo =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ),
      });
    },

    deleteTodo(id: number): void {
      patchState(store, {
        todos: store.todos().filter(todo => todo.id !== id),
      });
    },

    setFilter(filter: 'all' | 'active' | 'completed'): void {
      patchState(store, { filter });
    },

    clearCompleted(): void {
      patchState(store, {
        todos: store.todos().filter(todo => !todo.completed),
      });
    },

    // rxMethod để xử lý search với debounce
    searchTodos: rxMethod<string>(
      pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap((searchTerm) => {
          patchState(store, { searchTerm, isLoading: true });
        }),
        tap(() => {
          // Simulate async search
          setTimeout(() => {
            patchState(store, { isLoading: false });
          }, 100);
        })
      )
    ),

    // rxMethod để load todos (có thể mở rộng với API call)
    loadTodos: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() => {
          // Simulate API call
          return new Promise<Todo[]>((resolve) => {
            setTimeout(() => {
              resolve([
                { id: 1, title: 'Học Angular Signals', completed: false },
                { id: 2, title: 'Tìm hiểu rxMethod', completed: false },
                { id: 3, title: 'Tạo dự án demo', completed: true },
              ]);
            }, 500);
          });
        }),
        tap((todos) => {
          patchState(store, { todos, isLoading: false });
        })
      )
    ),
  }))
);
