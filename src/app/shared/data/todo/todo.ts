
export interface Task {
	text: string
	client:string
	completed: boolean
	priority: string
	badgeClass: string
	Date: string
  }
export const task: Task[] = [
	{
	text: "Check validation involves making sure all your tags are properly closed and nested",
	client:"Amadou Mboup",
	priority: "In progress",
	badgeClass: "badge-light-primary",
	Date: "16 Jan",
	completed: false
},
{
	text: "Test the outgoing links from all the pages to the specific domain under test.",
	client:"Amine Laghlabi",
	priority: "Pending",
	badgeClass: "badge-light-danger",
	Date: "04 Aug",
	completed: false
},
{
	text: "Test links are used to send emails to admin or other users from web pages.",
	client:"Mehdi Boulloul",
	priority: "Done",
	badgeClass: "badge-light-success",
	Date: "25 Feb",
	completed: true
},
{
	text: "Options to create forms, if any, form deletes a view or modify the forms.",
	client:"Amadou Mboup",
	priority: "Done",
	badgeClass: "badge-light-success",
	Date: "30 Jan",
	completed: true
},
{
	text: "Wrong inputs in the forms to the fields in the forms.",
	client:"Amadou Mboup",
	priority: "In progress",
	badgeClass: "badge-light-primary",
	Date: "06 Nov",
	completed: false
},
{
	text: "Check if the instructions provided are perfect to satisfy its purpose.",
	client:"Amadou Mboup",
	priority: "Pending",
	badgeClass: "badge-light-danger",
	Date: "08 Dec",
	completed: false
},
{
	text: "Application server and Database server interface.",
	client:"Amine Laghlabi",
	priority: "Done",
	badgeClass: "badge-light-success",
	Date: "15 Mar",
	completed: true
},


]