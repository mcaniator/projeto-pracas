CREATE DATABASE square_project;


USE square_project;


-- Usuário
CREATE TABLE User (
	id int UNIQUE NOT NULL AUTO_INCREMENT,
	name varchar(255) NOT NULL,
	type int NOT NULL,
	phone_number varchar(20) NOT NULL,
	email varchar(160) NOT NULL,
	password varchar(60) NOT NULL,
	PRIMARY KEY(id)
);


-- Local

CREATE TABLE PlanningUnit (
	id int UNIQUE NOT NULL AUTO_INCREMENT,
	name varchar(255) NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE PlanningRegion (
	id int UNIQUE NOT NULL AUTO_INCREMENT,
	name varchar(255) NOT NULL,
	planning_unit_id int UNIQUE NOT NULL,
	FOREIGN KEY (planning_unit_id) REFERENCES PlanningUnit (id),
	PRIMARY KEY(id)
);

CREATE TABLE Address (
	id int UNIQUE NOT NULL AUTO_INCREMENT,
    cep varchar(10) NOT NULL,
    UF varchar(100) NOT NULL,
    city varchar(100) NOT NULL,
    neighborhood varchar(100) NOT NULL,
    street varchar(255) NOT NULL,
    number int NOT NULL,
    complement varchar(255),
	planning_region_id int NOT NULL,
	FOREIGN KEY (planning_region_id) REFERENCES PlanningRegion(id),
	PRIMARY KEY(id)
);

CREATE TABLE Local (
	id int UNIQUE NOT NULL AUTO_INCREMENT,
	name varchar(255) NOT NULL,
    nickname varchar(255) NOT NULL,
	type int NOT NULL,
	free_space_category int,
    comments TEXT,
    creation_year varchar(4),
    reform_year varchar(4),
    mayor_creation varchar(255),
    legislation varchar(255),
    useful_area NUMERIC(7,2),
	area_pjf NUMERIC(7,2),
    angle_inclination NUMERIC(7,2),
    urban_region BOOLEAN,
    inactive_not_found BOOLEAN NOT NULL,
	address_id int UNIQUE NOT NULL,
	FOREIGN KEY (address_id) REFERENCES Address(id),
	PRIMARY KEY(id)
);

CREATE TABLE Event (
	id int UNIQUE NOT NULL AUTO_INCREMENT,
	description varchar(255) NOT NULL,
	local_id int UNIQUE NOT NULL,
	FOREIGN KEY (local_id) REFERENCES Local (id),
	PRIMARY KEY(id)
);


-- Contagem
CREATE TABLE PersonOnLocal (
	id int UNIQUE NOT NULL AUTO_INCREMENT,
	age_rating int NOT NULL,
	physical_activity BOOLEAN NOT NULL,
	deficiency_person BOOLEAN NOT NULL,
	illegal_activity BOOLEAN NOT NULL,
	homeless BOOLEAN NOT NULL,
	PRIMARY KEY(id)
);

CREATE TABLE Counting (
	id int UNIQUE NOT NULL AUTO_INCREMENT,
	name varchar(255) NOT NULL,
	init_date_time datetime NOT NULL,
	end_date_time datetime NOT NULL,
	count_animals int DEFAULT 0,
	temperature NUMERIC(7,2),
	sky varchar(50),
    person_on_local_id int UNIQUE NOT NULL,
	FOREIGN KEY (person_on_local_id) REFERENCES PersonOnLocal(id),
	local_id int UNIQUE NOT NULL,
	FOREIGN KEY (local_id) REFERENCES Local(id),
	PRIMARY KEY(id)
);


-- Avaliação
CREATE TABLE Evaluation (
	id int UNIQUE NOT NULL AUTO_INCREMENT,
	name varchar(255) NOT NULL,
	type NUMERIC(7,2) NOT NULL,
	email NUMERIC(7,2),
	password varchar(60) NOT NULL,
	user_id int UNIQUE NOT NULL,
	FOREIGN KEY (user_id) REFERENCES User(id),
	PRIMARY KEY(id)
);

CREATE TABLE Noise (
	id int UNIQUE NOT NULL AUTO_INCREMENT,
	db_level NUMERIC(7,2) NOT NULL,
	is_weekend BOOLEAN NOT NULL,
	positioning int NOT NULL,
	category int NOT NULL,
	evaluation_id int UNIQUE NOT NULL,
	FOREIGN KEY (evaluation_id) REFERENCES Evaluation(id),
	PRIMARY KEY(id)
);

CREATE TABLE Morphology (
	id int UNIQUE NOT NULL AUTO_INCREMENT,
	category int NOT NULL,
	divided BOOLEAN NOT NULL,
	evaluation_id int UNIQUE NOT NULL,
	FOREIGN KEY (evaluation_id) REFERENCES Evaluation(id),
	PRIMARY KEY(id)
);

CREATE TABLE Via (
	id int UNIQUE NOT NULL AUTO_INCREMENT,
	typology varchar(100) NOT NULL,
	morphology_id int UNIQUE NOT NULL,
	FOREIGN KEY (morphology_id) REFERENCES Morphology(id),
	PRIMARY KEY(id)
);

CREATE TABLE UseDensityAround (
	id int UNIQUE NOT NULL AUTO_INCREMENT,
	use_type NUMERIC(7,2) NOT NULL,
	institutional_use BOOLEAN NOT NULL,
	count_houses int NOT NULL,
	others_relevant_elements varchar(255) NOT NULL,
	night_use BOOLEAN NOT NULL,
	day_use BOOLEAN NOT NULL,
	third_place BOOLEAN NOT NULL,
	third_place_description TEXT NOT NULL,
	evaluation_id int UNIQUE NOT NULL,
	FOREIGN KEY (evaluation_id) REFERENCES Evaluation(id),
	PRIMARY KEY(id)
);

CREATE TABLE StreetSafety (
	id int UNIQUE NOT NULL AUTO_INCREMENT,
	crosswalk BOOLEAN NOT NULL,
	semaphore BOOLEAN NOT NULL,
	protection_fence BOOLEAN NOT NULL,
	speed_limit_plate BOOLEAN NOT NULL,
	evaluation_id int UNIQUE NOT NULL,
	FOREIGN KEY (evaluation_id) REFERENCES Evaluation(id),
	PRIMARY KEY(id)
);

CREATE TABLE PeoplePositioning (
	id int UNIQUE NOT NULL AUTO_INCREMENT,
	name varchar(255) NOT NULL,
	evaluation_id int UNIQUE NOT NULL,
	FOREIGN KEY (evaluation_id) REFERENCES Evaluation(id),
	PRIMARY KEY(id)
);

CREATE TABLE Photo (
	id int UNIQUE NOT NULL AUTO_INCREMENT,
	description varchar(255) NOT NULL,
	path TEXT NOT NULL,
	evaluation_id int UNIQUE NOT NULL,
	FOREIGN KEY (evaluation_id) REFERENCES Evaluation(id),
	PRIMARY KEY(id)
);

CREATE TABLE Suveirllance (
	id int UNIQUE NOT NULL AUTO_INCREMENT,
	camera BOOLEAN NOT NULL,
	police_station BOOLEAN NOT NULL,
	visibility INT NOT NULL,
	permeable_facade INT NOT NULL,
	active_facade INT NOT NULL,
	evaluation_id int UNIQUE NOT NULL,
	FOREIGN KEY (evaluation_id) REFERENCES Evaluation(id),
	PRIMARY KEY(id)
);

CREATE TABLE Depredation (
	id int UNIQUE NOT NULL AUTO_INCREMENT,
	graffiti INT NOT NULL,
	abandonment INT NOT NULL,
	evaluation_id int UNIQUE NOT NULL,
	FOREIGN KEY (evaluation_id) REFERENCES Evaluation(id),
	PRIMARY KEY(id)
);

CREATE TABLE AcessAround (
	id int UNIQUE NOT NULL AUTO_INCREMENT,
	name_plate INT NOT NULL,
	trasport_point INT NOT NULL,
	taxi_point INT NOT NULL,
	fence BOOLEAN NOT NULL,
	vihicle_parking INT NOT NULL,
	motorcycle_parking INT NOT NULL,
	bike_lane BOOLEAN NOT NULL,
	bike_rack INT NOT NULL,
	evaluation_id int UNIQUE NOT NULL,
	FOREIGN KEY (evaluation_id) REFERENCES Evaluation(id),
	PRIMARY KEY(id)
);

CREATE TABLE Accessibility (
	id int UNIQUE NOT NULL AUTO_INCREMENT,
	seidewalk INT NOT NULL,
	type INT NOT NULL,
	evaluation_id int UNIQUE NOT NULL,
	FOREIGN KEY (evaluation_id) REFERENCES Evaluation(id),
	PRIMARY KEY(id)
);

CREATE TABLE Playground (
	id int UNIQUE NOT NULL AUTO_INCREMENT,
	name varchar(255) NOT NULL,
	material_type INT NOT NULL,
	quantity INT NOT NULL,
	crack_greater_8mm BOOLEAN NOT NULL,
	pointed_object BOOLEAN NOT NULL,
	sharp_corner BOOLEAN NOT NULL,
	conservation INT NOT NULL,
	evaluation_id int UNIQUE NOT NULL,
	FOREIGN KEY (evaluation_id) REFERENCES Evaluation(id),
	PRIMARY KEY(id)
);

CREATE TABLE UseAreaEvaluation (
	id int UNIQUE NOT NULL AUTO_INCREMENT,
	quantity INT NOT NULL,
	shadow_area BOOLEAN NOT NULL,
	lighting BOOLEAN NOT NULL,
	walled BOOLEAN NOT NULL,
	seats BOOLEAN NOT NULL,
	conservation INT NOT NULL,
	meter INT NOT NULL,
	photo_path TEXT,
	evaluation_id int UNIQUE NOT NULL,
	FOREIGN KEY (evaluation_id) REFERENCES Evaluation(id),
	PRIMARY KEY(id)
);

CREATE TABLE UseArea (
	id int UNIQUE NOT NULL AUTO_INCREMENT,
	element varchar(255) NOT NULL,
	type INT NOT NULL,
	use_area_eval_id int UNIQUE NOT NULL,
	FOREIGN KEY (use_area_eval_id) REFERENCES UseAreaEvaluation(id),
	PRIMARY KEY(id)
);