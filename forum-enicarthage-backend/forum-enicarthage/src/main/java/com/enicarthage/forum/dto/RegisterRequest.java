package com.enicarthage.forum.dto;
import com.enicarthage.forum.model.RoleEnum;
import lombok.Data;
@Data
public class RegisterRequest {
    private String nom;
    private String email;
    private String motDePasse;
    private RoleEnum role;
}