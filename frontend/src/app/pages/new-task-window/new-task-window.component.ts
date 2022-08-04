import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TaskService } from 'src/app/task.service';

@Component({
  selector: 'app-new-task-window',
  templateUrl: './new-task-window.component.html',
  styleUrls: ['./new-task-window.component.scss']
})
export class NewTaskWindowComponent implements OnInit {

  listId!:string;

  constructor(private taskService: TaskService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.listId = params['listId'];
    })
  }


  createTask(title:String) {
    this.taskService.createTask(title, this.listId).subscribe((newTask) => {
    });
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
