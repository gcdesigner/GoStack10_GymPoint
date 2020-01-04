import { combineReducers } from 'redux';

import auth from './auth/reducer';
import user from './user/reducer';
import student from './student/reducer';
import pack from './pack/reducer';
import enroll from './enroll/reducer';
import helpOrder from './helpOrder/reducer';

export default combineReducers({
  auth,
  user,
  student,
  pack,
  enroll,
  helpOrder,
});
