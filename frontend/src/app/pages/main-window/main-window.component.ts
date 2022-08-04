import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TaskService } from 'src/app/task.service';

@Component({
  selector: 'app-main-window',
  templateUrl: './main-window.component.html',
  styleUrls: ['./main-window.component.scss']
})
export class MainWindowComponent implements OnInit {

  lists: any;
  tasks: any;
  listId!:string;
  constructor(private taskService:TaskService, private route:ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      if(params['listId']) {
        this.taskService.getTasks(params['listId']).subscribe((tasks: any) => {
          this.tasks = tasks;
        })
      } else {
        this.tasks = undefined;
      }
    });

    this.taskService.getLists().subscribe((lists) => {
      this.lists = lists;
    });
  }

  OnTaskClick(task: any) {
    this.taskService.toggleComplete(task).subscribe(()=> {
      task.completed = !task.completed;
    });
  }
}
