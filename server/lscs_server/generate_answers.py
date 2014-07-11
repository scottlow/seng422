from rest_api.models import *

print("LETSA GO!")
checklists = Checklist.objects.all()
for checklist in checklists:
	print("looking at checklist: " + checklist.title)
	checklist_questions = ChecklistQuestion.objects.filter(checklistType__pk=checklist.checklistType.id)
	for question in checklist_questions:
		answer = ChecklistAnswer(checklist=checklist, question=question)
		answer.save()

print("JOB DONE")