package com.hyfive.backend.medical.dto;

import com.hyfive.backend.medical.entity.MedicalRecord;
import com.hyfive.backend.medical.entity.Prescription;
import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
public class MedicalRecordDto {

    private Long medicalRecordId;
    private Long petId;
    private LocalDate visitDate;
    private String type;
    private String clinicName;
    private Integer totalCost;
    private String diagnosis;
    private String content;
    private String notes;
    private List<PrescriptionDto> prescriptions;

    public MedicalRecordDto(MedicalRecord medicalRecord) {
        this.medicalRecordId = medicalRecord.getMedicalRecordId();
        this.petId = medicalRecord.getPetId();
        this.visitDate = medicalRecord.getVisitDate();
        this.type = medicalRecord.getType().name();
        this.clinicName = medicalRecord.getClinicName();
        this.totalCost = medicalRecord.getTotalCost();
        this.diagnosis = medicalRecord.getDiagnosis();
        this.content = medicalRecord.getContent();
        this.notes = medicalRecord.getNotes();
        this.prescriptions = medicalRecord.getPrescriptions()
                .stream()
                .map(PrescriptionDto::new)
                .toList();
    }

    @Getter
    public static class PrescriptionDto {
        private Long prescriptionId;
        private String content;
        private Integer period;

        public PrescriptionDto(Prescription prescription) {
            this.prescriptionId = prescription.getPrescriptionId();
            this.content = prescription.getContent();
            this.period = prescription.getPeriod();
        }
    }
}
