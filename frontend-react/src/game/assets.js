
export function loadGameAssets(k) {
    // Load all assets with full paths (matching vanilla version structure)
    const v = Date.now();
    k.loadSprite("b-cell-neutral", `/assets/animation_frames/B-Cells/B-Cell_Idle(Neutral Form).png?v=${v}`);
    k.loadSprite("b-cell-squash", `/assets/animation_frames/B-Cells/B-Cell_Idle(Squash Form).png?v=${v}`);
    k.loadSprite("b-cell-stretch", `/assets/animation_frames/B-Cells/B-Cell_Idle(Stretch Form).png?v=${v}`);
    k.loadSprite("flu-virus", `/assets/animation_frames/Flu Virus/Flu-virus.png?v=${v}`);
    k.loadSprite("flu-virus-death", `/assets/animation_frames/Flu Virus/Flu-virus_Death.png?v=${v}`);
    k.loadSprite("y-antibody", `/assets/animation_frames/B-Cells/Y-Antibody_projectile.png?v=${v}`);
    k.loadSprite("macrophage-idle-neutral", `/assets/animation_frames/Macrophage/Macrophage_Idle(Neutral).png?v=${v}`);
    k.loadSprite("macrophage-idle-excited", `/assets/animation_frames/Macrophage/Macrophage_Idle(Excited).png?v=${v}`);
    k.loadSprite("macrophage-prepare", `/assets/animation_frames/Macrophage/Macrophage_Attack(Prepare_To_Eat).png?v=${v}`);
    k.loadSprite("macrophage-attack", `/assets/animation_frames/Macrophage/Macrophage_Attack(Big_Munch).png?v=${v}`);
    k.loadSprite("platelet-idle", `/assets/animation_frames/Platelet/Platelet_Idle.png?v=${v}`);
    k.loadSprite("platelet-idle2", `/assets/animation_frames/Platelet/Platelet_Idle1.png?v=${v}`);
    k.loadSprite("platelet-prepare", `/assets/animation_frames/Platelet/Platelet_PrepareToThrow.png?v=${v}`);
    k.loadSprite("platelet-throw", `/assets/animation_frames/Platelet/Platelet_AfterThrowSwing.png?v=${v}`);
    k.loadSprite("fibrin-projectile", `/assets/animation_frames/Platelet/Fibrin-net_Projectile.png?v=${v}`);
    k.loadSprite("fibrin-expanded", `/assets/animation_frames/Platelet/Fibrin-net_Expanded.png?v=${v}`);
    k.loadSprite("basophil-idle", `/assets/animation_frames/Basophil/Basophil_Idle.png?v=${v}`);
    k.loadSprite("basophil-idle2", `/assets/animation_frames/Basophil/Basophil_Idle1.png?v=${v}`);
    k.loadSprite("basophil-throw", `/assets/animation_frames/Basophil/Basophil_Throw.png?v=${v}`);
    k.loadSprite("bomb-projectile", `/assets/animation_frames/Basophil/Histamin_Bomb_Projectile.png?v=${v}`);
    k.loadSprite("explosion-effect", `/assets/animation_frames/Basophil/Explosion_Effect.png?v=${v}`);

    // NK Cell
    k.loadSprite("nk-cell-aim-down", `/assets/animation_frames/NK-Cell/NK-Cell_Aim_Down.png?v=${v}`);
    k.loadSprite("nk-cell-aim-side", `/assets/animation_frames/NK-Cell/NK-Cell_Aim_Side.png?v=${v}`);
    k.loadSprite("nk-cell-aim-side-1", `/assets/animation_frames/NK-Cell/NK-Cell_Aim_Side_1.png?v=${v}`);
    k.loadSprite("nk-cell-aim-up", `/assets/animation_frames/NK-Cell/NK-Cell_Aim_Up.png?v=${v}`);
    k.loadSprite("nk-cell-aim-up-1", `/assets/animation_frames/NK-Cell/NK-Cell_Aim_Up_1.png?v=${v}`);
}
