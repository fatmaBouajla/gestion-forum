package com.enicarthage.forum.security;

import com.enicarthage.forum.model.*;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class TacheAuthorizationHelper {

    @Transactional(readOnly = true)
    public boolean peutAccederTache(Utilisateur u, Tache t) {
        if (u == null || t == null) {
            return false;
        }
        return switch (u.getRole()) {
            case ADMIN, COMITE_PILOTAGE, COORDINATRICE -> true;
            case CHEF_COMITE -> t.getComite().getChef() != null
                    && t.getComite().getChef().getId().equals(u.getId());
            case MEMBRE -> t.getMembre() != null && t.getMembre().getId().equals(u.getId());
        };
    }

    /** Chef / coordinatrice / pilotage / admin peuvent modifier assignation et priorites. */
    @Transactional(readOnly = true)
    public boolean peutGererTacheEtendu(Utilisateur u, Tache t) {
        if (u == null || t == null) {
            return false;
        }
        return switch (u.getRole()) {
            case ADMIN, COMITE_PILOTAGE, COORDINATRICE -> true;
            case CHEF_COMITE -> t.getComite().getChef() != null
                    && t.getComite().getChef().getId().equals(u.getId());
            case MEMBRE -> false;
        };
    }
}
