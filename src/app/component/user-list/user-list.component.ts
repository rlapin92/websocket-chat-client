import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {WebsocketService} from '../../service/websocket.service';
import {EventType, UserEvent} from '../../model/user-event';
import {map} from 'rxjs/operators';
import {ChatMessage} from '../../model/chatmessage_pb';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.styl']
})
export class UserListComponent implements OnInit, OnDestroy {
  users: Array<string> = [];

  constructor(private websocketService: WebsocketService) {
  }

  private usersSubscription;
  private userEventSubscription;

  ngOnInit() {
    this.usersSubscription  = this.websocketService.getUsers$()
      .pipe(map<ChatMessage, string[]>(msg => msg.getContent().split(',')))
      .subscribe(users => this.users = users);;
    this.userEventSubscription = this.websocketService.getUserEvent$()
      .pipe(map<ChatMessage, UserEvent>(msg => ({
        event: (msg.getType() === ChatMessage.MessageType.JOIN ? EventType.JOIN : EventType.LOGOUT),
        name: msg.getContent()
      })))
      .subscribe(event => {
        switch (event.event) {
          case EventType.JOIN:
            this.users.push(event.name);
            break;
          case EventType.LOGOUT:
            this.users.splice(this.users.indexOf(event.name), 1);
            break;
        }
      });
  }
  ngOnDestroy() {
    this.usersSubscription.unsubscribe();
    this.userEventSubscription.unsubscribe();
  }

}
