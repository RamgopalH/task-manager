import { Injectable } from '@angular/core';
import { List } from './models/list.model';
import { WebRequestService } from './web-request.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private webReq: WebRequestService) { }

  createList(title: String) {
    return this.webReq.post('lists', { title })
  }

  getLists() {
    return this.webReq.get('lists');
  }

  getTasks(listId: any) {
    return this.webReq.get(`lists/${ listId }/tasks`);
  }

  createTask(title:String, listId:string) {
    return this.webReq.post(`lists/${listId}/tasks`, { title })
  }

  toggleComplete(task: any) {
    return this.webReq.patch(`lists/${task._listId}/tasks/${task._id}`, { "completed": !task.completed });
  }
}
