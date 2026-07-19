export interface ApiErrorType {
    statusCode: number;
    message: string;
}

export class ApiError extends Error implements ApiErrorType{
    statusCode: number;
    success:boolean;
    constructor(statusCode: number,message:string){
        super(message);
        this.statusCode = statusCode;
        this.success = false;
        this.name = this.constructor.name;
    }
}


