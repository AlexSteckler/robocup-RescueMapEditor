import {ErrorHandler, Injectable, NgZone} from "@angular/core";
import {HttpErrorResponse} from "@angular/common/http";
import {ToastrService} from "ngx-toastr";

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  public static toastr: ToastrService;

  constructor(private zone: NgZone) {
  }

  handleError(error: any) {
    console.error('Error from global error handler', error);
    // Check if it's an error from an HTTP response
    if (!(error instanceof HttpErrorResponse)) {
      error = error.rejection; // get the error object
    }
    this.zone.run(() => {

    });
    if (error) {
      let message = "An error occurred";
      if (error.error && error.error.message) {
        message = error.error.message;
      } else {
        message = error.message;
      }
      GlobalErrorHandler.toastr.error(
        message,
        "Error",
      );

      if (error.status && error.status === 401) {
        GlobalErrorHandler.toastr.error("Sie sind berechtigt diese Aktion auszuführen. Das erneute Laden der Seite kann helfen.", "Error");
      }
    }
    return error;
  }
}
