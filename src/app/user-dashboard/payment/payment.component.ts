
  
import { Component, OnInit } from "@angular/core";
import { AuthService } from "src/app/shared/services/auth.service";
import * as _ from "underscore";
import { Router, RouterModule, ActivatedRoute } from "@angular/router";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';

@Component({
  selector: "app-payment",
  templateUrl: "./payment.component.html",
  styleUrls: ["./payment.component.css"]
})
export class PaymentComponent implements OnInit {
  allPaymentData: any;
  lid: any;
  paramtrainingId: number;
  userInfo: any;
  skillInfo: any;
  savedPaymentSuccess: any;
  PaymentForm : FormGroup;


  constructor(
    private auth: AuthService,
    public router: Router,
    private route: ActivatedRoute, 
    private fb: FormBuilder,
    private messageService : MessageService
  ) {}

  ngOnInit() {
    let localid = localStorage.getItem("lid");
    this.lid = +localid;
    this.getParamData();
    this.PaymentForm = this.fb.group({
      Name:['',[Validators.required]],
      Card:['',[Validators.required]],
      mm:['',[Validators.required]],
      yy:['',[Validators.required]],
      cv:['',[Validators.required]]
   });
  }

  getParamData() {
    this.route.queryParams.subscribe(params => {
      let id = params["trainingId"];
      this.paramtrainingId = +id;
      this.getTraining();
    });
  }

  getTraining() {
    console.log("in status");
    this.auth.getTrainingById(this.paramtrainingId).subscribe(data => {
      this.allPaymentData = data;
      this.getSkillDetails(this.allPaymentData.skillId);
    });
  }

  getSkillDetails(id) {
    this.auth.getSkillById(id).subscribe(data => {
      this.skillInfo = data;
    });
  }

  savePayment() {

    let data = {
      userId: this.allPaymentData.userId,
      trainerId: this.allPaymentData.mentorId,
      skillId: this.skillInfo.id,
      fees: this.skillInfo.fees,
      skillName: this.allPaymentData.skillname,
      trainingDetailsId: this.allPaymentData.id,
      paymentStatus: true,
      commission:0,
      trainerFees:0
    };

    console.log(data);

    this.auth.savePayment(data).subscribe(data => {
      this.savedPaymentSuccess = data;

      let id = this.savedPaymentSuccess.trainingDetailsId;
      this.auth.updateTrainingAndPaymentStatusById(id).subscribe(data => {
        this.messageService.add({
          severity: "success",
          detail: "Payment successfully done"
        });
        this.messageService.add({
          severity: "success",
          detail: "Check notification to start training"
        });
        this.router.navigate(["user-dashboard/payment-info"]);
      });
    });
  }
}