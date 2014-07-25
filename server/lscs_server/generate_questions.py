from rest_api.models import *

#manage.py shell << generate_questions.py
#Might look different, look up running a script from django manage.py

print("LETSA GO!")
sections = [
	("A - Section 1", [
		"Do you like me?",
		"Am I a good system?"
	]),
	("B - Section 2", [
		"How often do you use me?",
		"Would you like to get coffee sometime?"
	]),
]

for cType in types:
	typeObj = ChecklistType(title=cType[0])
	typeObj.save()
	for question in cType[1]:
		questionObj = ChecklistQuestion(question="bla", checklistType=typeObj)
		questionObj.save()

print("JOB DONE")