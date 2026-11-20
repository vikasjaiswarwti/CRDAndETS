export interface ComplaintThreadMessage {
  Message: string;
  ThreadBy: string;
  ThreadOn: string;
}


export interface ComplaintReply {
  rowNumber: number;
  referenceNo: number;
  complainName: string;
  empid: number;
  userName: string;
  mobileNo: string;
  locCode: number;
  office: string;
  complainMessage: string;
  complainDate: string;
  status: boolean;
  transportReply: string | null;
  replyDate: string;
  totalCount: number;
}

export interface ComplaintListResponse {
  items: ComplaintReply[];
  page: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}


export interface ComplaintListParams {
  locCode: number;
  compStatus: 0 | 1;
  empId?: number;
  page?: number;
  pageSize?: number;
}

export interface UpdateComplaintReplyBody {
  ReferenceNo: number;
  Message: string;
  Status: boolean;
}