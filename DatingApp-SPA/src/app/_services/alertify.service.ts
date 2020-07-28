import { Injectable } from '@angular/core';
import * as alertify from 'alertifyjs';

@Injectable({
  providedIn: 'root'
})
export class AlertifyService {

  constructor() { }

  confirm(message: string, okCallback: () => any): any{

    // show confirm message. send in an event of type any.
    // if there is an event, run okCallback. If not, return
    // nothing, so don't confirm.

    alertify.confirm(message, (e: any) => {
      if (e) {
        okCallback();
      } else {}
    });
  }

  success(message: string): any{
    alertify.success(message);
  }

  error(message: string): any{
    alertify.error(message);
  }

  warning(message: string): any{
    alertify.warning(message);
  }

  message(message: string): any{
    alertify.message(message);
  }

}
