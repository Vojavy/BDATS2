package com.bdas_dva.backend.Model.Zamestnanec;

import java.util.Date;

public class ZamestnanecRequest {
    private Long idZamestnance;
    private Date datumZamestnani;
    private Integer pracovnidoba;
    private Long supermarketIdSupermarketu;
    private Long skladIdSkladu;
    private Long zamestnanecIdZamestnance;
    private Long adresaIdAdresy;
    private String jmeno;
    private String prijmeni;
    private Double mzda;
    private Long poziceIdPozice;

    // Getters and Setters

    public Long getIdZamestnance() {
        return idZamestnance;
    }

    public void setIdZamestnance(Long idZamestnance) {
        this.idZamestnance = idZamestnance;
    }

    public Date getDatumZamestnani() {
        return datumZamestnani;
    }

    public void setDatumZamestnani(Date datumZamestnani) {
        this.datumZamestnani = datumZamestnani;
    }

    public Integer getPracovnidoba() {
        return pracovnidoba;
    }

    public void setPracovnidoba(Integer pracovnidoba) {
        this.pracovnidoba = pracovnidoba;
    }

    public Long getSupermarketIdSupermarketu() {
        return supermarketIdSupermarketu != null && supermarketIdSupermarketu > 0 ? supermarketIdSupermarketu : null;
    }

    public void setSupermarketIdSupermarketu(Long supermarketIdSupermarketu) {
        this.supermarketIdSupermarketu = supermarketIdSupermarketu;
    }

    public Long getSkladIdSkladu() {
        return skladIdSkladu != null && skladIdSkladu > 0 ? skladIdSkladu : null;
    }

    public void setSkladIdSkladu(Long skladIdSkladu) {
        this.skladIdSkladu = skladIdSkladu;
    }

    public Long getZamestnanecIdZamestnance() {
        return zamestnanecIdZamestnance != null && zamestnanecIdZamestnance > 0 ? zamestnanecIdZamestnance : null;
    }

    public void setZamestnanecIdZamestnance(Long zamestnanecIdZamestnance) {
        this.zamestnanecIdZamestnance = zamestnanecIdZamestnance;
    }

    public Long getAdresaIdAdresy() {
        return adresaIdAdresy != null && adresaIdAdresy > 0 ? adresaIdAdresy : null;
    }

    public void setAdresaIdAdresy(Long adresaIdAdresy) {
        this.adresaIdAdresy = adresaIdAdresy;
    }

    public String getJmeno() {
        return jmeno != null && !jmeno.isEmpty() ? jmeno : null;
    }

    public void setJmeno(String jmeno) {
        this.jmeno = jmeno;
    }

    public String getPrijmeni() {
        return prijmeni != null && !prijmeni.isEmpty() ? prijmeni : null;
    }

    public void setPrijmeni(String prijmeni) {
        this.prijmeni = prijmeni;
    }

    public Double getMzda() {
        return mzda != null && mzda > 0 ? mzda : null;
    }

    public void setMzda(Double mzda) {
        this.mzda = mzda;
    }

    public Long getPoziceIdPozice() {
        return poziceIdPozice;
    }

    public void setPoziceIdPozice(Long poziceIdPozice) {
        this.poziceIdPozice = poziceIdPozice;
    }
}
