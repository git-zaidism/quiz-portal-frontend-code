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
  constructor(private userService: UserService, private snack: MatSnackBar) {}

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


  ngOnInit(): void {}

  formSubmit() {

    if (this.user.username == '' || this.user.username == null) {
      this.snack.open('Username is required !! ', '', {
        duration: 3000,
      });
      return;
    }

    if (this.user.password == '' || this.user.password == null) {
      this.snack.open('Password is required !! ', '', {
        duration: 3000,
      });
      return;
    }

     if(this.user.firstName=='' || this.user.firstName == null || !(this.user.firstName.match(this.alphabets)) ){
      this.snack.open('Invalid First Name!! ', '', {
        duration: 3000,
      });
      return;
    }

     if(this.user.lastName=='' || this.user.lastName == null || !(this.user.lastName.match(this.alphabets)) ){
      this.snack.open('Invalid Last Name!! ', '', {
        duration: 3000,
      });
      return;
    }
     if(!this.user.phone.match(this.phoneNumber)){
      this.snack.open('Invalid Phone Number!! ', '', {
        duration: 3000,
      });
      return;
    }
      //saving user
          this.userService.addUser(this.user).subscribe(
            (data: any) => {
              //success
              console.log(data);
              //alert('success');
              Swal.fire('Successfully done !!', 'User id is ' + data.id, 'success');
            },
            (error) => {
              //error
              console.log(error);
              // alert('something went wrong');
              this.snack.open(error.error.text, '', {
                duration: 3000,
              });
            }
          );
    
  }

  validateUser(User:any){

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
