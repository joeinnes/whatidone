'use strict';
import MaterialDateTimePicker from 'material-datetime-picker';

const picker = new MaterialDateTimePicker()
    .on('submit', (val) => console.log(`data: ${val}`))
    .on('open', () => console.log('opened'))
    .on('close', () => console.log('closed'));

document.querySelector('.c-datepicker-btn')
    .on('click', () => picker.open());        