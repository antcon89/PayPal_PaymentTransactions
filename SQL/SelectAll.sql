ALTER PROC [dbo].[PaymentTransactions_SelectAll]
	
	@pageIndex int 
	,@pageSize int

/*
		Declare 
			@pageIndex int = 0
			,@pageSize int = 4

		Execute [dbo].[PaymentTransactions_SelectAll]
			@pageIndex
			,@pageSize 
*/

AS

BEGIN

	Declare @offset int = @pageIndex * @pageSize

		SELECT p.[Id]
			  ,p.[SubscriptionId]
			  ,p.[OrderId]
			  ,p.[Name]
			  ,p.[Cost]
			  ,p.[IsRenewed]
			  ,p.[SubscriptionTypeId]
			  ,s.[Name] as SubscriptionName
			  ,s.[Cost]
			  ,s.[Description]
			  ,s.[PlanId]
			  ,p.[PaymentTypeId]
			  ,ty.[PaymentType]
			  ,p.[DateCreated]
			  ,p.[DateModifed]
			  ,p.[CreatedBy]
			  ,p.[ModifiedBy]
			  ,TotalCount = COUNT(1) OVER()
	  FROM [dbo].[PaymentTransactions] AS p 
			INNER JOIN dbo.SubscriptionType AS s
				ON p.SubscriptionTypeId = s.Id
			INNER JOIN dbo.PaymentTypes AS ty
				ON p.PaymentTypeId = ty.Id

	  ORDER BY Id

	  OFFSET @offSet Rows

	  Fetch Next @pageSize Rows ONLY

END
