
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
	text: "Préparer la liste des pieces du dossier de la carte de sejour",
	client:"Amadou Mboup",
	priority: "En Cours",
	badgeClass: "badge-light-primary",
	Date: "16 Janvier",
	completed: false
},
{
	text: "Remettre la liste des pieces du dossier carte sejour",
	client:"Amine Laghlabi",
	priority: "En Attente",
	badgeClass: "badge-light-danger",
	Date: "04 Août",
	completed: false
},
{
	text: "Receptionner les pieces du depot de la carte de sejour",
	client:"Mehdi Boulloul",
	priority: "Terminé",
	badgeClass: "badge-light-success",
	Date: "25 Février",
	completed: true
},
{
	text: "Préparer la liste des pieces du dossier de la carte de sejour",
	client:"Amadou Mboup",
	priority: "Terminé",
	badgeClass: "badge-light-success",
	Date: "30 Janvier",
	completed: true
},
{
	text: "Receptionner les pieces du depot de la carte de sejour",
	client:"Amadou Mboup",
	priority: "En Cours",
	badgeClass: "badge-light-primary",
	Date: "06 Novembre",
	completed: false
},
{
	text: "Valider le dossier de la carte de sejour",
	client:"Amadou Mboup",
	priority: "En Attente",
	badgeClass: "badge-light-danger",
	Date: "08 Décembre",
	completed: false
},
{
	text: "Receptionner les pieces du depot de la carte de sejour",
	client:"Amine Laghlabi",
	priority: "Terminé",
	badgeClass: "badge-light-success",
	Date: "15 Mars",
	completed: true
},


]