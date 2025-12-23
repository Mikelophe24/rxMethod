import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoStore } from './todo.store';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class AppComponent {
  store = inject(TodoStore);
  newTodoTitle = signal('');
  searchInput = signal('');

  constructor() {
    // Effect để theo dõi search input và gọi rxMethod
    effect(() => {
      this.store.searchTodos(this.searchInput());
    });
  }

  addTodo() {
    const title = this.newTodoTitle().trim();
    if (title) {
      this.store.addTodo(title);
      this.newTodoTitle.set('');
    }
  }

  onSearchChange(value: string) {
    this.searchInput.set(value);
  }
}
