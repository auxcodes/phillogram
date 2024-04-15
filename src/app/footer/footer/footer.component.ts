import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  date: number = 2077;
  name: string = 'AuxCodes'

  constructor() { }

  ngOnInit() {

    this.date = (new Date()).getFullYear();
  }

}
