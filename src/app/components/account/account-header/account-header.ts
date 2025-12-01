import {
  Component,
  input,
  InputSignal,

} from '@angular/core';
import { User } from '../../../utils/interfaces/user.interface';

@Component({
  selector: 'section[appAccountHeader]',
  imports: [],
  templateUrl: './account-header.html',
  styleUrl: './account-header.scss',
})
export class AccountHeader {
  
  user:InputSignal<User> = input.required()

  
}
