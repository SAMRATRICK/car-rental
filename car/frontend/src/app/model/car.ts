export class CarModel {
  carId: number;
  brand: string;
  model: string;
  year: number;
  color: string;
  dailyRate: number;
  carImage: string;
  regNo: string;

  constructor(){ //created claass
    this.brand='';
    this.carId=0;
    this.carImage='';
    this.color='';
    this.dailyRate=0;
    this.model='';
    this.regNo='';
    this.year=0;
  }

  
}
export interface ApiResponse{
    "message":string,
    "result":boolean,
    "data":any
  }

