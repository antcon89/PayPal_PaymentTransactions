using Sabio.Data;
using Sabio.Data.Providers;
using Sabio.Models;
using Sabio.Models.Domain.Payments;
using Sabio.Models.Requests.Payment;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sabio.Services
{
    public class PaymentTransactionsService : IPaymentTransactionsService
    {
        IDataProvider _data = null;
        public PaymentTransactionsService(IDataProvider data)
        {
            _data = data;
        }
        public void Delete(int id)
        {
            string procName = "[PaymentTransactions_Delete_ById]";
            _data.ExecuteNonQuery(procName,
            inputParamMapper: delegate (SqlParameterCollection col)
            {
                col.AddWithValue("@Id", id);
            },
            returnParameters: null);
        }
        public void Update(PaymentTransactionUpdateRequest model, int currentUserId)
        {

            string procName = "[dbo].[PaymentTransactions_Update]";
            _data.ExecuteNonQuery(procName,
            inputParamMapper: delegate (SqlParameterCollection col)
            {
                col.AddWithValue("@Id", model.Id);
                AddCommonParams(model, col, currentUserId);
            },
            returnParameters: null);
        }
        public int Add(PaymentTransactionAddRequest model, int currentUserId)
        {
            int id = 0;

            string procName = "[dbo].[PaymentTransactions_Insert]";
            _data.ExecuteNonQuery(procName,
            inputParamMapper: delegate (SqlParameterCollection col)
            {
                SqlParameter idOut = new SqlParameter("@Id", SqlDbType.Int);
                idOut.Direction = ParameterDirection.Output;

                col.Add(idOut);
                AddCommonParams(model, col, currentUserId);
                col.AddWithValue("@CreatedBy", currentUserId);
            },
            returnParameters: delegate (SqlParameterCollection returnCollection)
            {
                object oId = returnCollection["@Id"].Value;
                int.TryParse(oId.ToString(), out id);
            });
            return id;
        }
        private static void AddCommonParams(PaymentTransactionAddRequest model, SqlParameterCollection col, int currentUserId)
        {
            col.AddWithValue("@SubscriptionId", model.SubscriptionId);
            col.AddWithValue("@OrderId", model.OrderId);
            col.AddWithValue("@Name", model.Name);
            col.AddWithValue("@Cost", model.Cost);
            col.AddWithValue("@IsRenewed", model.IsRenewed);
            col.AddWithValue("@SubscriptionTypeId", model.SubscriptionTypeId);
            col.AddWithValue("@PaymentTypeId", model.PaymentTypeId);
            col.AddWithValue("@ModifiedBy", currentUserId);
        }
        public PaymentTransaction Get(int id)
        {
            string procName = "[dbo].[PaymentTransactions_Select_ById]";

            PaymentTransaction paymentAccount = null;

            _data.ExecuteCmd(procName, delegate (SqlParameterCollection parameterCollection)
            {
                parameterCollection.AddWithValue("@Id", id);
            }
            , delegate (IDataReader reader, short set)
            {
                int startingIndex = 0;
                paymentAccount = MapPaymentAccount(reader, ref startingIndex);
            });
            return paymentAccount;
        }
        public List<PaymentTransaction> GetTop()
        {
            string procName = "[PaymentTransactions_Select_Top_5_Subscriptions]";
            List<PaymentTransaction> list = null;

            _data.ExecuteCmd(procName, inputParamMapper: null
            , singleRecordMapper: delegate (IDataReader reader, short set)
            {
                int startingIndex = 0;
                PaymentTransaction aPaymentTransaction = MapPaymentAccount(reader, ref startingIndex);
                if (list == null)
                {
                    list = new List<PaymentTransaction>();
                }
                list.Add(aPaymentTransaction);
            });
            return list;
        }
        public Paged<PaymentTransaction> GetPage(int pageIndex, int pageSize)
        {
            Paged<PaymentTransaction> pagedList = null;
            List<PaymentTransaction> list = null;
            int totalCount = 0;

            string procName = "[dbo].[PaymentTransactions_SelectAll]";

            _data.ExecuteCmd(procName, delegate (SqlParameterCollection param)
            {
                param.AddWithValue("@pageIndex", pageIndex);
                param.AddWithValue("@pageSize", pageSize);
            }
           , delegate (IDataReader reader, short set)
           {
               int startingIndex = 0;
               PaymentTransaction aPaymentTransaction = MapPaymentAccount(reader, ref startingIndex);
               if (totalCount == 0)
               {
                   totalCount = reader.GetSafeInt32(startingIndex++);
               }
               if (list == null)
               {
                   list = new List<PaymentTransaction>();
               }
               list.Add(aPaymentTransaction);
           }
           );
            if (list != null)
            {
                pagedList = new Paged<PaymentTransaction>(list, pageIndex, pageSize, totalCount);
            }
            return pagedList;
        }
        public Paged<PaymentTransaction> GetPageByCreatedBy(int pageIndex, int pageSize, int currentUserId)
        {
            Paged<PaymentTransaction> pagedList = null;
            List<PaymentTransaction> list = null;
            int totalCount = 0;

            string procName = "[dbo].[PaymentTransactions_Select_ByCreatedBy]";

            _data.ExecuteCmd(procName, delegate (SqlParameterCollection param)
            {
                param.AddWithValue("@pageIndex", pageIndex);
                param.AddWithValue("@pageSize", pageSize);
                param.AddWithValue("@CreatedBy", currentUserId);
            }
           , delegate (IDataReader reader, short set)
           {
               int startingIndex = 0;
               PaymentTransaction aPaymentAccount = MapPaymentAccount(reader, ref startingIndex);
               if (totalCount == 0)
               {
                   totalCount = reader.GetSafeInt32(startingIndex++);
               }
               if (list == null)
               {
                   list = new List<PaymentTransaction>();
               }
               list.Add(aPaymentAccount);
           }
           );
            if (list != null)
            {
                pagedList = new Paged<PaymentTransaction>(list, pageIndex, pageSize, totalCount);
            }
            return pagedList;
        }
        private static PaymentTransaction MapPaymentAccount(IDataReader reader, ref int startingIdex)
        {
            PaymentTransaction payment = new PaymentTransaction();

            payment.Id = reader.GetSafeInt32(startingIdex++);
            payment.SubscriptionId = reader.GetSafeString(startingIdex++);
            payment.OrderId = reader.GetSafeString(startingIdex++);
            payment.Name = reader.GetSafeString(startingIdex++);
            payment.Cost = reader.GetSafeDecimal(startingIdex++);
            payment.IsRenewed = reader.GetSafeBool(startingIdex++);

            payment.SubscriptionType = new SubscriptionType();
            payment.SubscriptionType.Id = reader.GetSafeInt32(startingIdex++);
            payment.SubscriptionType.Name = reader.GetSafeString(startingIdex++);
            payment.SubscriptionType.Cost = reader.GetSafeDecimal(startingIdex++);
            payment.SubscriptionType.Description = reader.GetSafeString(startingIdex++);
            payment.SubscriptionType.PlanId = reader.GetSafeString(startingIdex++);

            payment.PaymentTypeId = reader.GetSafeInt32(startingIdex++);
            payment.PaymentType = reader.GetSafeString(startingIdex++);
            payment.DateCreated = reader.GetSafeDateTime(startingIdex++);
            payment.DateModifed = reader.GetSafeDateTime(startingIdex++);
            payment.CreatedBy = reader.GetSafeInt32(startingIdex++);
            payment.ModifiedBy = reader.GetSafeInt32(startingIdex++);

            return payment;
        }
    }
}
