import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { SKILLS } from "@/data/skills";

import {
  getSkillCharacters,
  querySkills,
} from "./search";

describe("getSkillCharacters", () => {
  it("devuelve personajes únicos y ordenados", () => {
    const characters = getSkillCharacters();

    assert.ok(characters.length > 0);

    assert.equal(
      characters.length,
      new Set(characters).size
    );

    assert.deepEqual(
      characters,
      [...characters].sort((a, b) =>
        a.localeCompare(b)
      )
    );

    assert.ok(characters.includes("Yami Yugi"));
  });
});

describe("querySkills", () => {
  it("pagina el catálogo completo", () => {
    const result = querySkills();

    assert.equal(result.total, SKILLS.length);

    assert.equal(result.page, 1);

    assert.equal(result.skills.length, 18);

    assert.equal(
      result.pages,
      Math.ceil(SKILLS.length / 18)
    );
  });

  it("filtra por personaje sin alterar la lista de personajes", () => {
    const result = querySkills({
      character: "Yami Yugi",
    });

    assert.ok(result.skills.length > 0);

    assert.ok(
      result.skills.every(
        (skill) =>
          skill.character === "Yami Yugi"
      )
    );

    assert.equal(
      result.characters.length,
      getSkillCharacters().length
    );
  });

  it("busca sin distinguir mayúsculas ni acentos", () => {
    const result = querySkills({
      search: "fusión",
      limit: 60,
    });

    assert.ok(result.skills.length > 0);

    assert.ok(
      result.skills.every((skill) =>
        `${skill.name} ${skill.character} ${skill.description}`
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .includes("fusion")
      )
    );
  });

  it("combina búsqueda y personaje", () => {
    const result = querySkills({
      search: "draw",
      character: "Yami Yugi",
      limit: 60,
    });

    assert.ok(result.skills.length > 0);

    assert.ok(
      result.skills.every(
        (skill) =>
          skill.character === "Yami Yugi" &&
          `${skill.name} ${skill.description}`
            .toLowerCase()
            .includes("draw")
      )
    );
  });

  it("limita la página y el tamaño máximos", () => {
    const result = querySkills({
      page: 99,
      limit: 1000,
    });

    assert.equal(result.page, 1);

    assert.equal(result.pages, 1);

    assert.equal(
      result.skills.length,
      SKILLS.length
    );
  });
});
