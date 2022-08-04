import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TaskService } from 'src/app/task.service';

@Component({
  selector: 'app-new-list-window',
  templateUrl: './new-list-window.component.html',
  styleUrls: ['./new-list-window.component.scss']
})
export class NewListWindowComponent implements OnInit {
  constructor(private taskService: TaskService, private router: Router) { }
  ngOnInit(): void {
  }

  createList(title:String) {
    this.taskService.createList(title).subscribe((response: any ) => {
      this.router.navigate(['/lists', response._id]);
    });
  }
}
