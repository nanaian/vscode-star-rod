import * as vscode from 'vscode'
import { getStarRodDirVersion, handleInstallPrompt } from './extension'
import Mod from './Mod'

export default function activate(ctx: vscode.ExtensionContext) {
    ctx.subscriptions.push(vscode.commands.registerCommand('starRod.compileMod', async () => {
        if (!getStarRodDirVersion()) {
            vscode.window.showErrorMessage('Star Rod installation directory is not configured.')
            return
        }

        const mod = Mod.getActive()

        if (!mod) {
            vscode.window.showErrorMessage('No mod folder open.')
            return
        }
        
        // TODO: complain if mod.cfg not exist

        let obj = await vscode.window.withProgress({
            title: `Compiling Mod...`,
            location: vscode.ProgressLocation.Window,
        }, () => mod.compile())
        
        if (obj.emitError) await obj.emitError()
        else {
            const choice = await vscode.window.showInformationMessage('Compiled mod.', 'Run Mod')
            if (choice === 'Run Mod') {
                await mod.runEmulator()
            }
        }
    }))

    ctx.subscriptions.push(vscode.commands.registerCommand('starRod.compileMap', async () => {
        if (!getStarRodDirVersion()) {
            vscode.window.showErrorMessage('Star Rod installation directory is not configured.')
            return
        }

        const mod = Mod.getActive()

        if (!mod) {
            vscode.window.showErrorMessage('No mod folder open.')
            return
        }

        const map = await vscode.window.showQuickPick(await mod.getSaveMaps())
        if (map) {
            let obj = await vscode.window.withProgress({
                title: `Compiling ${map}...`,
                location: vscode.ProgressLocation.Window,
            }, () => mod.compileMap(map))

            if (obj.emitError) await obj.emitError()
            else vscode.window.showInformationMessage(`Compiled ${map}.`)
        }
    }))

    ctx.subscriptions.push(vscode.commands.registerCommand('starRod.runMod', async () => {
        const mod = Mod.getActive()

        if (!mod) {
            vscode.window.showErrorMessage('No mod folder open.')
            return
        }

        await mod.runEmulator()
    }))
}