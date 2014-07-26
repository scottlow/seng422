from rest_api.models import *

#manage.py shell << generate_questions.py
#Might look different, look up running a script from django manage.py

print("LETSA GO!")
sections = [
	("A - Plan Title", [
		"Type of Plan",
		"Legal Description & registered plan no.",
		"BCGS NO.",
		"Appropriate Scale & Bar, including intended plot size",
		"Legend explaining all symbols and non-standard abbreviations",
		"Bearing derivation and reference",
		"Notation: bearings to BTs are magnetic or planned bearings",
		"North Point"
	]),
	("B - Main Body of Plan", [
		"Appropriate designation for title or Interest parcels (e.g. Lot Number)",
		"All essential dimensions given and closure calculated",
		"Title & Interest Parcel Area or Volume correct & to required precision-GSI Rule 3",
		"Boundaries reestablished and/or lots divided in accordance with Land Survey Act",
		"Sufficient ties to evidence of previous surveys",
		"Monumentation labelled and correct - GSI Rule 1-2 to 1-7",
		"Read or “Lane” and name, when available, where road is being dedicated",
		"Remember to check for hooked parcels, part parcels and remainders",
		"New Dedicated Road or RW fully dimensioned with widths indicated-GSI Rule",
		"No text less than 2mm",
		"Plotting to scale and drafting legible - GSI Rule 3-2 & 3-3",
		"Bold outline 1.0 - 1.5 mm centered on boundary (including any detail drawings)",
		"Existing R/W, Easement or Covenant boundaries shown with broken lines - GSI Rule 3-4",
		"Details of bearing trees and ancillary evidence found and made - GSI Rule 3-4",
		"Radius, arc, radial bearings for each curve point - GSI Rule 3-4",
		"Railway plan in un-surveyed land has district lot number assigned",
		"Access to water body where applicable - LTA s75(1)",
		"Label Un-surveyed Crown Land including theoretical or unsurveyed portions of townships"
	]),
	("C - Scenery", [
		"Check status of adjacent roads. Have they all been dedicated?",
		"Parcel boundaries (incl. highway, roads and railway) shown with solid lines - Rule 3-4(2)(g)",
		"Description(s) given for all surrounding lands - GSI Rule 3-4(1)(r)",
		"Primary parcel designations prominent in body of plan (use 'DL' not 'Lot') - Rule 10-14",
		"Existing Road Names shown - GSI Rule 3-4",
		"Roads, Trails, and Seismic Lines shown and labelled with width and posted as required",
		"'Rem' added on lot and 'portion of' or 'part of' in title where appropriate"
	]),
	("D - Deposit Statement", [
		"Plan lies within (Regional District) statement - GSI Rule 3-4",
		"Leave 7 cm 12 cm clear space in top right corner for Registrar's notation pursuant to S 56 LTA"
	]),
	("E - Integrated Survey Area", [
		"Grid bearing notation; ISA name and number, datum and bearing derivation - GSI Rule 5-7",
		"Control monuments tied in accordance with GSI Rules 5-4(2)",
		"Meets accuracy standards of integrated legal survey - GSI Rule 5-4 (3) & (4)",
		"Control monuments shown on plan with required symbol and respective designation - GSI Rule 5-7(2)"
	]),
	("F - Miscellaneous", [
		"Spelling check",
		"Standard plan size - GSI Rule 3-1",
		"If practical, top of plan orientated north - GSI Rule 3-3(5)",
		"Notation regarding existing records that plan is compiled from"
	]),
	("G - Electronic Plan", [
		"Plan Image created with Adobe 6.0 or higher with minimum 600 dpi resolution - GSI Rule 3-1 (1)",
		"All plan features black ink on white background with no ornate fonts - GSI Rule 3-3(1)",
		"No signatures on plan - GSI Rule 3-3(7)",
		"Plan complies with all standards for electronic submissions approved by S.G. GSI Rule 3-3 (12)"
	])
]

for section in sections:
	sectionObj = ChecklistType(name=section[0])
	sectionObj.save()
	for question in section[1]:
		questionObj = ChecklistQuestion(question=question, checklistType=sectionObj)
		questionObj.save()

print("JOB DONE")