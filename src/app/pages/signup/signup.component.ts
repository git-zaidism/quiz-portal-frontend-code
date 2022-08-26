import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  constructor(private userService: UserService, private snack: MatSnackBar) { }

  public user = {
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  };

  //regex for validations
  public alphabets = /^[A-Za-z]+$/;
  public phoneNumber = /^\d{10}$/;


  ngOnInit(): void { }

  formSubmit() {
    let validationError = false;

    if (this.user.username == '' || this.user.username == null) {
      validationError = true;
      this.snack.open('Username is Mandatory!', '', {
        duration: 3000,
      });
      return;
    }

    if (this.user.password == '' || this.user.password == null) {
      validationError = true;
      this.snack.open('Password is Mandatory!', '', {
        duration: 3000,
      });
      return;
    }

    if (this.user.firstName == '' || this.user.firstName == null || !(this.user.firstName.match(this.alphabets))) {
      validationError = true;
      this.snack.open('Invalid First Name', '', {
        duration: 3000,
      });
      return;
    }

    if (this.user.lastName == '' || this.user.lastName == null || !(this.user.lastName.match(this.alphabets))) {
      validationError = true;
      this.snack.open('Invalid Last Name!', '', {
        duration: 3000,
      });
      return;
    }
    if (!this.user.phone.match(this.phoneNumber)) {
      validationError = true;
      this.snack.open('Invalid Phone Number!! ', '', {
        duration: 3000,
      });
      return;
    }

    if(!validationError) {
      this.userService.addUser(this.user).subscribe( // saving user
        (data: any) => {
          console.log(data);
          Swal.fire('User is successfully registered.', 'Your Username is ' + data.username, 'success');
        },
        (error) => {
          console.log(error);
          this.snack.open(error.error.text, '', {
            duration: 3000,
          });
        }
      );
    }
  }

  onClear() {
    this.user.username = '';
    this.user.password = '';
    this.user.firstName = '';
    this.user.lastName = '';
    this.user.email = '';
    this.user.phone = '';
  }

}
