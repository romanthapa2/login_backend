
// export interface ApiResponse<T = any> {
//     statusCode: number;
//     success: boolean;
//     message: string;
//     data?: T;
// }

// export class ApiResponse <T = any> implements ApiResponse {
//     statusCode:number;
//     success:boolean;
//     message:string;
//     data?: T;
//     constructor(statusCode :number,message:string,data?: T){
//         this.statusCode = statusCode;
//         this.success = true;
//         this.message = message;
//         this.data = data;
//     }
// }

//  this class is used to create a standard response for the api. it takes the parameters and returns a object.

//  t is generic type. it can be any type but must be specified when creating the object. but any type does not check anything. so ues generic type.



import { Response } from "express";
import { StatusCodes } from "http-status-codes";


interface StandardResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
}

export function apiResponse<T>(
  res: Response, 
  statusCode: StatusCodes, 
  message: string, 
  data?: T
): Response {
  const success = true;

  const responseBody: StandardResponse<T> = {
    success,
    statusCode,
    message,
    data,
  };

  return res.status(statusCode).json(responseBody);
}