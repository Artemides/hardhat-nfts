import { deployments, ethers, network } from "hardhat";
import { developmentChains } from "../hardhat.config.helper";
import { AggregatorInterface, AggregatorV3Interface, SvgHiosToken } from "../typechain-types";
import { assert, expect } from "chai";
const SAD_SVG_URI =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzEiIGhlaWdodD0iMzEiIHZpZXdCb3g9IjAgMCAzMSAzMSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEzLjIxMSAxOUMxMi40MDI0IDIwLjE3NzQgMTEuMDY4MiAyMC45NDk2IDkuNTMxOTQgMjAuOTQ5NkM5LjA3OTEzIDIwLjk0OTYgOC42NDE5OSAyMC44ODI1IDguMjI5OTIgMjAuNzU3N0M4LjEzNjEzIDIwLjcyOTMgOC4wMzkxOCAyMC43OTggOC4wMzkxOCAyMC44OTZDOC4wMzkxOCAyMS41MDU3IDcuNTQ0OSAyMiA2LjkzNTE4IDIyQzYuMzI1NDYgMjIgNS44MzExOCAyMS41MDU3IDUuODMxMTggMjAuODk2TDUuODMxMTggMjBDNS44MzExNyAxOS40NDc3IDYuMjc4ODkgMTkgNi44MzExOCAxOUgxMy4yMTFaIiBmaWxsPSIjMjEyMTIxIi8+CjxwYXRoIGQ9Ik0xNi43NTA1IDE5QzE3LjU1OTEgMjAuMTc3NCAxOC44OTMzIDIwLjk0OTYgMjAuNDI5NSAyMC45NDk2QzIwLjg4MjMgMjAuOTQ5NiAyMS4zMTk1IDIwLjg4MjUgMjEuNzMxNSAyMC43NTc3QzIxLjgyNTMgMjAuNzI5MyAyMS45MjIzIDIwLjc5OCAyMS45MjIzIDIwLjg5NkMyMS45MjIzIDIxLjUwNTcgMjIuNDE2NiAyMiAyMy4wMjYzIDIyQzIzLjYzNiAyMiAyNC4xMzAzIDIxLjUwNTcgMjQuMTMwMyAyMC44OTZMMjQuMTMwMyAyMEMyNC4xMzAzIDE5LjQ0NzcgMjMuNjgyNiAxOSAyMy4xMzAzIDE5SDE2Ljc1MDVaIiBmaWxsPSIjMjEyMTIxIi8+CjxwYXRoIGQ9Ik05LjAxNTY0IDcuNDAzODZMOS4wMTg4NCA3LjM4NzYzQzkuMDY0NDggNy4xMTU1MyA5LjMyMTg2IDYuOTMyMjMgOS41OTQwOCA2Ljk3NzZDOS44NjY0NiA3LjAyMjk5IDEwLjA1MDUgNy4yODA2MSAxMC4wMDUxIDcuNTUyOTlMOS41MTE4OCA3LjQ3MDc5QzEwLjAwNTEgNy41NTI5OSAxMC4wMDQ5IDcuNTU0MjMgMTAuMDA0OSA3LjU1NDIzTDEwLjAwNDYgNy41NTU3NEwxMC4wMDM5IDcuNTU5NkwxMC4wMDE5IDcuNTcwNkMxMC4wMDAzIDcuNTc5MzYgOS45OTgwOSA3LjU5MDk2IDkuOTk1MTYgNy42MDUyMUM5Ljk4OTMgNy42MzM2OSA5Ljk4MDY3IDcuNjcyODQgOS45Njg1OSA3LjcyMTE1QzkuOTQ0NDcgNy44MTc2MyA5LjkwNjQ1IDcuOTUxMzcgOS44NDkxNiA4LjExMDAyQzkuNzM1MDEgOC40MjYxMSA5LjU0MTcgOC44NDg1MiA5LjIyMzQyIDkuMjcyODlDOC41NzM1NSAxMC4xMzk0IDcuNDI4NzQgMTAuOTc1IDUuNTA2MjkgMTAuOTc1QzUuMjMwMTQgMTAuOTc1IDUuMDA2MjkgMTAuNzUxMSA1LjAwNjI5IDEwLjQ3NUM1LjAwNjI5IDEwLjE5ODggNS4yMzAxNCA5Ljk3NDk5IDUuNTA2MjkgOS45NzQ5OUM3LjA4ODczIDkuOTc0OTkgNy45NDY3MSA5LjMwODQ5IDguNDIzNDIgOC42NzI4OUM4LjY2ODQyIDguMzQ2MjIgOC44MTkzNCA4LjAxNzU3IDguOTA4NiA3Ljc3MDM4QzguOTUzMDIgNy42NDczOCA4Ljk4MTQ5IDcuNTQ2NDIgOC45OTg0NSA3LjQ3ODYxQzkuMDA2OTEgNy40NDQ3NyA5LjAxMjQ1IDcuNDE5MzggOS4wMTU2NCA3LjQwMzg2WiIgZmlsbD0iIzIxMjEyMSIvPgo8cGF0aCBkPSJNMjEuMDIzNSA3LjQwMzg2TDIxLjAyMDQgNy4zODgyM0wyMS4wMjAxIDcuMzg2OTNDMjAuOTc0IDcuMTE1NDYgMjAuNzE2OSA2LjkzMjI5IDIwLjQ0NSA2Ljk3NzZDMjAuMTcyNiA3LjAyMjk5IDE5Ljk4ODYgNy4yODA2MSAyMC4wMzQgNy41NTI5OUwyMC41MjcyIDcuNDcwNzlDMjAuMDM0IDcuNTUyOTkgMjAuMDM0MiA3LjU1NDIzIDIwLjAzNDIgNy41NTQyM0wyMC4wMzQ1IDcuNTU1NzRMMjAuMDM1MiA3LjU1OTZMMjAuMDM3MiA3LjU3MDZDMjAuMDM4OCA3LjU3OTM2IDIwLjA0MSA3LjU5MDk2IDIwLjA0MzkgNy42MDUyMUMyMC4wNDk4IDcuNjMzNjkgMjAuMDU4NCA3LjY3Mjg0IDIwLjA3MDUgNy43MjExNUMyMC4wOTQ2IDcuODE3NjMgMjAuMTMyNyA3Ljk1MTM3IDIwLjE5IDguMTEwMDJDMjAuMzA0MSA4LjQyNjExIDIwLjQ5NzQgOC44NDg1MiAyMC44MTU3IDkuMjcyODlDMjEuNDY1NiAxMC4xMzk0IDIyLjYxMDQgMTAuOTc1IDI0LjUzMjggMTAuOTc1QzI0LjgwOSAxMC45NzUgMjUuMDMyOCAxMC43NTExIDI1LjAzMjggMTAuNDc1QzI1LjAzMjggMTAuMTk4OCAyNC44MDkgOS45NzQ5OSAyNC41MzI4IDkuOTc0OTlDMjIuOTUwNCA5Ljk3NDk5IDIyLjA5MjQgOS4zMDg0OSAyMS42MTU3IDguNjcyODlDMjEuMzcwNyA4LjM0NjIyIDIxLjIxOTggOC4wMTc1NyAyMS4xMzA1IDcuNzcwMzhDMjEuMDg2MSA3LjY0NzM4IDIxLjA1NzYgNy41NDY0MiAyMS4wNDA3IDcuNDc4NjFDMjEuMDMyMiA3LjQ0NDc3IDIxLjAyNjcgNy40MTkzOCAyMS4wMjM1IDcuNDAzODZaIiBmaWxsPSIjMjEyMTIxIi8+CjxwYXRoIGQ9Ik0xMi41MTcxIDIyLjQzNTFDMTIuMjA5MiAyMi4xNTggMTEuNzM1IDIyLjE4MyAxMS40NTc5IDIyLjQ5MDhDMTEuMTgwOCAyMi43OTg3IDExLjIwNTggMjMuMjcyOSAxMS41MTM3IDIzLjU1QzEyLjQzOTcgMjQuMzgzNSAxMy43NjQ5IDI0Ljc1NjUgMTUuMDE5NiAyNC43NTY1QzE2LjI3NDMgMjQuNzU2NSAxNy41OTk0IDI0LjM4MzUgMTguNTI1NSAyMy41NUMxOC44MzM0IDIzLjI3MjkgMTguODU4MyAyMi43OTg3IDE4LjU4MTIgMjIuNDkwOEMxOC4zMDQxIDIyLjE4MyAxNy44Mjk5IDIyLjE1OCAxNy41MjIgMjIuNDM1MUMxNi45NDYgMjIuOTUzNSAxNi4wMTggMjMuMjU2NSAxNS4wMTk2IDIzLjI1NjVDMTQuMDIxMSAyMy4yNTY1IDEzLjA5MzIgMjIuOTUzNSAxMi41MTcxIDIyLjQzNTFaIiBmaWxsPSIjMjEyMTIxIi8+CjxwYXRoIGQ9Ik0xMy44MTY4IDE2LjI4NDZDMTMuODE2OCAxNi45MDM2IDEzLjY2NDggMTcuNDg3MiAxMy4zOTYxIDE4SDYuODM1MTJDNi41NjY0MSAxNy40ODcyIDYuNDE0NDIgMTYuOTAzNiA2LjQxNDQyIDE2LjI4NDZDNi40MTQ0MiAxNC4yNDA1IDguMDcxNDkgMTIuNTgzNCAxMC4xMTU2IDEyLjU4MzRDMTIuMTU5NyAxMi41ODM0IDEzLjgxNjggMTQuMjQwNSAxMy44MTY4IDE2LjI4NDZaTTEyLjUyODkgMTYuMzM5MkMxMy4wNzUgMTUuOTYxNCAxMy4xNDI5IDE1LjExMzIgMTIuNjgwNCAxNC40NDQ3QzEyLjIxOCAxMy43NzYyIDExLjQwMDMgMTMuNTQwNiAxMC44NTQxIDEzLjkxODRDMTAuMzA4IDE0LjI5NjMgMTAuMjQwMSAxNS4xNDQ1IDEwLjcwMjYgMTUuODEzQzExLjE2NTEgMTYuNDgxNCAxMS45ODI3IDE2LjcxNzEgMTIuNTI4OSAxNi4zMzkyWiIgZmlsbD0iIzIxMjEyMSIvPgo8cGF0aCBkPSJNMTYuNTY1MyAxOEgyMy4xMjYzQzIzLjM5NSAxNy40ODcyIDIzLjU0NyAxNi45MDM2IDIzLjU0NyAxNi4yODQ2QzIzLjU0NyAxNC4yNDA1IDIxLjg4OTkgMTIuNTgzNCAxOS44NDU4IDEyLjU4MzRDMTcuODAxNyAxMi41ODM0IDE2LjE0NDYgMTQuMjQwNSAxNi4xNDQ2IDE2LjI4NDZDMTYuMTQ0NiAxNi45MDM2IDE2LjI5NjYgMTcuNDg3MiAxNi41NjUzIDE4Wk0yMi4wMTExIDE2LjMzOTJDMjEuNDY0OSAxNi43MTcxIDIwLjY0NzMgMTYuNDgxNCAyMC4xODQ4IDE1LjgxM0MxOS43MjIzIDE1LjE0NDUgMTkuNzkwMiAxNC4yOTYzIDIwLjMzNjMgMTMuOTE4NEMyMC44ODI1IDEzLjU0MDYgMjEuNzAwMSAxMy43NzYyIDIyLjE2MjYgMTQuNDQ0N0MyMi42MjUxIDE1LjExMzIgMjIuNTU3MiAxNS45NjE0IDIyLjAxMTEgMTYuMzM5MloiIGZpbGw9IiMyMTIxMjEiLz4KPHBhdGggZD0iTTMuNzY4MzEgNS4zOTEzOEM2LjMyMTE1IDIuNjE5MjcgMTAuMTA4MiAwLjk2Mjg5MSAxNS4wMTg0IDAuOTYyODkxQzE5LjkyODcgMC45NjI4OTEgMjMuNzE1NyAyLjYxOTI3IDI2LjI2ODYgNS4zOTEzOEMyOC44MDkgOC4xNTAwMSAzMC4wMzY5IDExLjkxNDggMzAuMDM2OSAxNS45ODEzQzMwLjAzNjkgMjAuMDQ3OSAyOC44MDkgMjMuODEyNyAyNi4yNjg2IDI2LjU3MTNDMjMuNzE1NyAyOS4zNDM0IDE5LjkyODcgMzAuOTk5OCAxNS4wMTg0IDMwLjk5OThDMTAuMTA4MiAzMC45OTk4IDYuMzIxMTUgMjkuMzQzNCAzLjc2ODMxIDI2LjU3MTNDMS4yMjc4OSAyMy44MTI3IDAgMjAuMDQ3OSAwIDE1Ljk4MTNDMCAxMS45MTQ4IDEuMjI3ODkgOC4xNTAwMSAzLjc2ODMxIDUuMzkxMzhaTTUuMjM5NTEgNi43NDYyMUMzLjEwNzU4IDkuMDYxMjcgMiAxMi4zMDU3IDIgMTUuOTgxM0MyIDE5LjY1NyAzLjEwNzU4IDIyLjkwMTQgNS4yMzk1MSAyNS4yMTY1QzcuMzU5MDMgMjcuNTE4IDEwLjU4MTIgMjguOTk5OCAxNS4wMTg0IDI4Ljk5OThDMTkuNDU1NyAyOC45OTk4IDIyLjY3NzkgMjcuNTE4IDI0Ljc5NzQgMjUuMjE2NUMyNi45MjkzIDIyLjkwMTQgMjguMDM2OSAxOS42NTcgMjguMDM2OSAxNS45ODEzQzI4LjAzNjkgMTIuMzA1NyAyNi45MjkzIDkuMDYxMjcgMjQuNzk3NCA2Ljc0NjIxQzIyLjY3NzkgNC40NDQ2NCAxOS40NTU3IDIuOTYyODkgMTUuMDE4NCAyLjk2Mjg5QzEwLjU4MTIgMi45NjI4OSA3LjM1OTAzIDQuNDQ0NjQgNS4yMzk1MSA2Ljc0NjIxWiIgZmlsbD0iIzIxMjEyMSIvPgo8L3N2Zz4K";
const SAD_TOKEN_URI = "data:application/json;base64,";
const HAPPY_TOKEN_URI =
    "data:application/json;base64,ewogICAgIm5hbWUiOiJTVkcgSGlvcyBUb2tlbiIsCiAgICAiZGVzY3JpcHRpb24iOiJBbmQgTkZUIHRoYXQgY2hhbmdlcyBiZXNlZCBvbiB0aGUgRXRoIHByaWNlIiwKICAgICJhdHRyaWJ1dGVzIjpbeyJ0cmFpdF90eXBlIjoiY29vbG5lc3MiLCJ2YWx1ZSI6MTAwfV0sCiAgICAiaW1hZ2UiOiJkYXRhOmltYWdlL3N2Zyt4bWw7YmFzZTY0LFBITjJaeUIzYVdSMGFEMGlNeklpSUdobGFXZG9kRDBpTXpJaUlIWnBaWGRDYjNnOUlqQWdNQ0F6TWlBek1pSWdabWxzYkQwaWJtOXVaU0lnZUcxc2JuTTlJbWgwZEhBNkx5OTNkM2N1ZHpNdWIzSm5Mekl3TURBdmMzWm5JajRLUEhCaGRHZ2daRDBpVFRFMUxqazVPRGtnTTBNeE9DNHpPREkySURNZ01qQXVOREUxSURNdU5ESTRNaklnTWpJdU1URXpOeUEwTGpFNE1UY3pUREl6TGpJek16a2dNaTQyT0RneU5FTXlNeTR5TnpBMUlESXVOak01TkRFZ01qTXVNekE0T0NBeUxqVTVNek1nTWpNdU16UTROU0F5TGpVME9UZzNRekl4TGpJNE5qWWdNUzQxTlRFeU5DQXhPQzQ0TWprMklERWdNVFV1T1RrNE9TQXhRekV6TGpFMk9Ea2dNU0F4TUM0M01USTBJREV1TlRVd09UVWdPQzQyTlRBNE5DQXlMalUwT1RBNVF6Z3VOamt3T0RjZ01pNDFPVEkzTkNBNExqY3lPVFFnTWk0Mk16a3hNU0E0TGpjMk5qSTFJREl1TmpnNE1qUk1PUzQ0T0RVM09DQTBMakU0TURrMVF6RXhMalU0TkRJZ015NDBNamM1TXlBeE15NDJNVFlnTXlBeE5TNDVPVGc1SUROYUlpQm1hV3hzUFNJak1qRXlNVEl4SWk4K0NqeHdZWFJvSUdROUlrMHpJREUxTGprNU9EbERNeUF4TkM0ME16WTVJRE11TWpBd016RWdNVEl1T1RVeU9TQXpMalU1TkRVeElERXhMalU0TlROTU1TNDRPVE16T1NBeE1DNDJOREF5UXpFdU9EWXpPVFVnTVRBdU5qSXpPU0F4TGpnek5USTFJREV3TGpZd05qa2dNUzQ0TURjeU9DQXhNQzQxT0RrMFF6RXVNalkyTWpRZ01USXVNamM1TnlBeElERTBMakV3TmpZZ01TQXhOUzQ1T1RnNVF6RWdNakF1TURZZ01pNHlNall5TmlBeU15NDRNVGs1SURRdU56WXpORElnTWpZdU5UYzFRemN1TXpFeklESTVMak0wTXpZZ01URXVNRGsxTWlBek1DNDVPVGM0SURFMUxqazVPRGtnTXpBdU9UazNPRU15TUM0NU1ESTJJRE13TGprNU56Z2dNalF1TmpnME9DQXlPUzR6TkRNMklESTNMakl6TkRNZ01qWXVOVGMxUXpJNUxqYzNNVFVnTWpNdU9ERTVPU0F6TUM0NU9UYzRJREl3TGpBMklETXdMams1TnpnZ01UVXVPVGs0T1VNek1DNDVPVGM0SURFMExqRXdOeUF6TUM0M016RTNJREV5TGpJNE1EWWdNekF1TVRrd09TQXhNQzQxT1RBMlF6TXdMakUyTXpVZ01UQXVOakEzTnlBek1DNHhNelUxSURFd0xqWXlORE1nTXpBdU1UQTJOeUF4TUM0Mk5EQXlUREk0TGpRd016WWdNVEV1TlRnMk5FTXlPQzQzT1RjMklERXlMamsxTXpjZ01qZ3VPVGszT0NBeE5DNDBNemN6SURJNExqazVOemdnTVRVdU9UazRPVU15T0M0NU9UYzRJREU1TGpZMk9URWdNamN1T0RreE9DQXlNaTQ1TURnM0lESTFMamMyTXpFZ01qVXVNakl3TWtNeU15NDJORFk1SURJM0xqVXhPRElnTWpBdU5ESTVOaUF5T0M0NU9UYzRJREUxTGprNU9Ea2dNamd1T1RrM09FTXhNUzQxTmpneElESTRMams1TnpnZ09DNHpOVEE0T0NBeU55NDFNVGd5SURZdU1qTTBOaklnTWpVdU1qSXdNa00wTGpFd05UazFJREl5TGprd09EY2dNeUF4T1M0Mk5qa3hJRE1nTVRVdU9UazRPVm9pSUdacGJHdzlJaU15TVRJeE1qRWlMejRLUEhCaGRHZ2daRDBpVFRndU56YzNORFVnTVRRdU1EWXlURFV1TnpJM016UWdNVFl1TkRNME0wTTFMalExTVRFMUlERTJMalkwT1RFZ05TNHdOVEUzTXlBeE5pNDBNekE0SURVdU1EZ3pOREVnTVRZdU1EZ3lNMHcxTGpNNE1qQTRJREV5TGpjNU5qbEROUzQwTlRNM05pQXhNaTR3TURnMUlEVXVNRFV6TmpNZ01URXVNalV5SURRdU16WXhOVGdnTVRBdU9EWTNOVXd5TGpNM09EazNJRGt1TnpZMk1VTXhMamd5TmpZMUlEa3VORFU1TWpVZ01TNDROemd3TWlBNExqWTBPRGM0SURJdU5EWTBOallnT0M0ME1UUXhNa3cwTGprNU5EQTRJRGN1TkRBeU16VkROUzQyTWpFMklEY3VNVFV4TXpRZ05pNHdOems1TVNBMkxqWXdNRE00SURZdU1qRXlORFlnTlM0NU16YzJNMHcyTGpZNE5ERTNJRE11TlRjNU1EWkROaTQ0TURZeU15QXlMamsyT0RjNUlEY3VOVGt5TnpjZ01pNDNPVEF6TnlBM0xqazJOakU1SURNdU1qZzRNalpNT1M0ek16QXpOeUExTGpFd056RTJRemt1TnpRMk5UY2dOUzQyTmpJeE1TQXhNQzQwTWpBMklEVXVPVFl4TnpVZ01URXVNVEV4TkNBMUxqZzVPRGsxVERFMExqWXdNemtnTlM0MU9ERTBOVU14TkM0NU5Ea2dOUzQxTlRBd09DQXhOUzR4TmpneElEVXVPVFF5TlRZZ01UUXVPVFl3TVNBMkxqSXhPVGd4VERFekxqRTNORFFnT0M0Mk1EQTRRekV5TGpjMU5UWWdPUzR4TlRreE9TQXhNaTQyTlRneUlEa3VPRGsxTlRJZ01USXVPVEUzTkNBeE1DNDFORE0yVERFMExqTXlPRFlnTVRRdU1EY3hOVU14TkM0ME1ESXpJREUwTGpJMU5UZ2dNVFF1TWpReU1TQXhOQzQwTkRnMElERTBMakEwTnpRZ01UUXVOREE1TlV3eE1DNHpPVGMySURFekxqWTNPVFZET1M0NE1qYzJNU0F4TXk0MU5qVTFJRGt1TWpNMk1qWWdNVE11TnpBMU1TQTRMamMzTnpRMUlERTBMakEyTWxvaUlHWnBiR3c5SWlNeU1USXhNakVpTHo0S1BIQmhkR2dnWkQwaVRUY2dNVGRETnlBeE55QTNJREkySURFMklESTJRekkxSURJMklESTFJREUzSURJMUlERTNTRGRhSWlCbWFXeHNQU0lqTWpFeU1USXhJaTgrQ2p4d1lYUm9JR1E5SWsweU15NHlNakkxSURFMExqQTJNa3d5Tmk0eU56STNJREUyTGpRek5ETkRNall1TlRRNE9DQXhOaTQyTkRreElESTJMamswT0RNZ01UWXVORE13T0NBeU5pNDVNVFkySURFMkxqQTRNak5NTWpZdU5qRTNPU0F4TWk0M09UWTVRekkyTGpVME5qSWdNVEl1TURBNE5TQXlOaTQ1TkRZMElERXhMakkxTWlBeU55NDJNemcwSURFd0xqZzJOelZNTWprdU5qSXhJRGt1TnpZMk1VTXpNQzR4TnpNeklEa3VORFU1TWpVZ016QXVNVEl5SURndU5qUTROemdnTWprdU5UTTFNeUE0TGpReE5ERXlUREkzTGpBd05Ua2dOeTQwTURJek5VTXlOaTR6TnpnMElEY3VNVFV4TXpRZ01qVXVPVEl3TVNBMkxqWXdNRE00SURJMUxqYzROelVnTlM0NU16YzJNMHd5TlM0ek1UVTRJRE11TlRjNU1EWkRNalV1TVRrek9DQXlMamsyT0RjNUlESTBMalF3TnpJZ01pNDNPVEF6TnlBeU5DNHdNek00SURNdU1qZzRNalpNTWpJdU5qWTVOaUExTGpFd056RTJRekl5TGpJMU16UWdOUzQyTmpJeE1TQXlNUzQxTnprMElEVXVPVFl4TnpVZ01qQXVPRGc0TmlBMUxqZzVPRGsxVERFM0xqTTVOakVnTlM0MU9ERTBOVU14Tnk0d05URWdOUzQxTlRBd09DQXhOaTQ0TXpFNUlEVXVPVFF5TlRZZ01UY3VNRE01T1NBMkxqSXhPVGd4VERFNExqZ3lOVFlnT0M0Mk1EQTRRekU1TGpJME5EUWdPUzR4TlRreE9TQXhPUzR6TkRFNElEa3VPRGsxTlRJZ01Ua3VNRGd5TmlBeE1DNDFORE0yVERFM0xqWTNNVFFnTVRRdU1EY3hOVU14Tnk0MU9UYzNJREUwTGpJMU5UZ2dNVGN1TnpVM09TQXhOQzQwTkRnMElERTNMamsxTWpZZ01UUXVOREE1TlV3eU1TNDJNREkwSURFekxqWTNPVFZETWpJdU1UY3lOQ0F4TXk0MU5qVTFJREl5TGpjMk16Y2dNVE11TnpBMU1TQXlNeTR5TWpJMUlERTBMakEyTWxvaUlHWnBiR3c5SWlNeU1USXhNakVpTHo0S1BDOXpkbWMrQ2c9PSIKfQ==";
const HAPPY_SVG_URI =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE1Ljk5ODkgM0MxOC4zODI2IDMgMjAuNDE1IDMuNDI4MjIgMjIuMTEzNyA0LjE4MTczTDIzLjIzMzkgMi42ODgyNEMyMy4yNzA1IDIuNjM5NDEgMjMuMzA4OCAyLjU5MzMgMjMuMzQ4NSAyLjU0OTg3QzIxLjI4NjYgMS41NTEyNCAxOC44Mjk2IDEgMTUuOTk4OSAxQzEzLjE2ODkgMSAxMC43MTI0IDEuNTUwOTUgOC42NTA4NCAyLjU0OTA5QzguNjkwODcgMi41OTI3NCA4LjcyOTQgMi42MzkxMSA4Ljc2NjI1IDIuNjg4MjRMOS44ODU3OCA0LjE4MDk1QzExLjU4NDIgMy40Mjc5MyAxMy42MTYgMyAxNS45OTg5IDNaIiBmaWxsPSIjMjEyMTIxIi8+CjxwYXRoIGQ9Ik0zIDE1Ljk5ODlDMyAxNC40MzY5IDMuMjAwMzEgMTIuOTUyOSAzLjU5NDUxIDExLjU4NTNMMS44OTMzOSAxMC42NDAyQzEuODYzOTUgMTAuNjIzOSAxLjgzNTI1IDEwLjYwNjkgMS44MDcyOCAxMC41ODk0QzEuMjY2MjQgMTIuMjc5NyAxIDE0LjEwNjYgMSAxNS45OTg5QzEgMjAuMDYgMi4yMjYyNiAyMy44MTk5IDQuNzYzNDIgMjYuNTc1QzcuMzEzIDI5LjM0MzYgMTEuMDk1MiAzMC45OTc4IDE1Ljk5ODkgMzAuOTk3OEMyMC45MDI2IDMwLjk5NzggMjQuNjg0OCAyOS4zNDM2IDI3LjIzNDMgMjYuNTc1QzI5Ljc3MTUgMjMuODE5OSAzMC45OTc4IDIwLjA2IDMwLjk5NzggMTUuOTk4OUMzMC45OTc4IDE0LjEwNyAzMC43MzE3IDEyLjI4MDYgMzAuMTkwOSAxMC41OTA2QzMwLjE2MzUgMTAuNjA3NyAzMC4xMzU1IDEwLjYyNDMgMzAuMTA2NyAxMC42NDAyTDI4LjQwMzYgMTEuNTg2NEMyOC43OTc2IDEyLjk1MzcgMjguOTk3OCAxNC40MzczIDI4Ljk5NzggMTUuOTk4OUMyOC45OTc4IDE5LjY2OTEgMjcuODkxOCAyMi45MDg3IDI1Ljc2MzEgMjUuMjIwMkMyMy42NDY5IDI3LjUxODIgMjAuNDI5NiAyOC45OTc4IDE1Ljk5ODkgMjguOTk3OEMxMS41NjgxIDI4Ljk5NzggOC4zNTA4OCAyNy41MTgyIDYuMjM0NjIgMjUuMjIwMkM0LjEwNTk1IDIyLjkwODcgMyAxOS42NjkxIDMgMTUuOTk4OVoiIGZpbGw9IiMyMTIxMjEiLz4KPHBhdGggZD0iTTguNzc3NDUgMTQuMDYyTDUuNzI3MzQgMTYuNDM0M0M1LjQ1MTE1IDE2LjY0OTEgNS4wNTE3MyAxNi40MzA4IDUuMDgzNDEgMTYuMDgyM0w1LjM4MjA4IDEyLjc5NjlDNS40NTM3NiAxMi4wMDg1IDUuMDUzNjMgMTEuMjUyIDQuMzYxNTggMTAuODY3NUwyLjM3ODk3IDkuNzY2MUMxLjgyNjY1IDkuNDU5MjUgMS44NzgwMiA4LjY0ODc4IDIuNDY0NjYgOC40MTQxMkw0Ljk5NDA4IDcuNDAyMzVDNS42MjE2IDcuMTUxMzQgNi4wNzk5MSA2LjYwMDM4IDYuMjEyNDYgNS45Mzc2M0w2LjY4NDE3IDMuNTc5MDZDNi44MDYyMyAyLjk2ODc5IDcuNTkyNzcgMi43OTAzNyA3Ljk2NjE5IDMuMjg4MjZMOS4zMzAzNyA1LjEwNzE2QzkuNzQ2NTcgNS42NjIxMSAxMC40MjA2IDUuOTYxNzUgMTEuMTExNCA1Ljg5ODk1TDE0LjYwMzkgNS41ODE0NUMxNC45NDkgNS41NTAwOCAxNS4xNjgxIDUuOTQyNTYgMTQuOTYwMSA2LjIxOTgxTDEzLjE3NDQgOC42MDA4QzEyLjc1NTYgOS4xNTkxOSAxMi42NTgyIDkuODk1NTIgMTIuOTE3NCAxMC41NDM2TDE0LjMyODYgMTQuMDcxNUMxNC40MDIzIDE0LjI1NTggMTQuMjQyMSAxNC40NDg0IDE0LjA0NzQgMTQuNDA5NUwxMC4zOTc2IDEzLjY3OTVDOS44Mjc2MSAxMy41NjU1IDkuMjM2MjYgMTMuNzA1MSA4Ljc3NzQ1IDE0LjA2MloiIGZpbGw9IiMyMTIxMjEiLz4KPHBhdGggZD0iTTcgMTdDNyAxNyA3IDI2IDE2IDI2QzI1IDI2IDI1IDE3IDI1IDE3SDdaIiBmaWxsPSIjMjEyMTIxIi8+CjxwYXRoIGQ9Ik0yMy4yMjI1IDE0LjA2MkwyNi4yNzI3IDE2LjQzNDNDMjYuNTQ4OCAxNi42NDkxIDI2Ljk0ODMgMTYuNDMwOCAyNi45MTY2IDE2LjA4MjNMMjYuNjE3OSAxMi43OTY5QzI2LjU0NjIgMTIuMDA4NSAyNi45NDY0IDExLjI1MiAyNy42Mzg0IDEwLjg2NzVMMjkuNjIxIDkuNzY2MUMzMC4xNzMzIDkuNDU5MjUgMzAuMTIyIDguNjQ4NzggMjkuNTM1MyA4LjQxNDEyTDI3LjAwNTkgNy40MDIzNUMyNi4zNzg0IDcuMTUxMzQgMjUuOTIwMSA2LjYwMDM4IDI1Ljc4NzUgNS45Mzc2M0wyNS4zMTU4IDMuNTc5MDZDMjUuMTkzOCAyLjk2ODc5IDI0LjQwNzIgMi43OTAzNyAyNC4wMzM4IDMuMjg4MjZMMjIuNjY5NiA1LjEwNzE2QzIyLjI1MzQgNS42NjIxMSAyMS41Nzk0IDUuOTYxNzUgMjAuODg4NiA1Ljg5ODk1TDE3LjM5NjEgNS41ODE0NUMxNy4wNTEgNS41NTAwOCAxNi44MzE5IDUuOTQyNTYgMTcuMDM5OSA2LjIxOTgxTDE4LjgyNTYgOC42MDA4QzE5LjI0NDQgOS4xNTkxOSAxOS4zNDE4IDkuODk1NTIgMTkuMDgyNiAxMC41NDM2TDE3LjY3MTQgMTQuMDcxNUMxNy41OTc3IDE0LjI1NTggMTcuNzU3OSAxNC40NDg0IDE3Ljk1MjYgMTQuNDA5NUwyMS42MDI0IDEzLjY3OTVDMjIuMTcyNCAxMy41NjU1IDIyLjc2MzcgMTMuNzA1MSAyMy4yMjI1IDE0LjA2MloiIGZpbGw9IiMyMTIxMjEiLz4KPC9zdmc+Cg==";

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Svg Hios Token", () => {
          let svgHiosToken: SvgHiosToken;
          let aggregatorV3: AggregatorV3Interface;
          let deployer: string;
          beforeEach(async () => {
              const [{ address }] = await ethers.getSigners();
              deployer = address;
              await deployments.fixture(["mocks", "svgNft"]);
              svgHiosToken = await ethers.getContract("SvgHiosToken", deployer);
              aggregatorV3 = await ethers.getContract("MockV3Aggregator", deployer);
          });
          describe("Constructor", () => {
              it("Starts correctly the initial states", async () => {
                  const happySvg = await svgHiosToken.getHappySvg();
                  const sadSvg = await svgHiosToken.getSadSvg();
                  const priceFeedAddress = await svgHiosToken.getPriceFeedAddress();
                  const tokenCounter = await svgHiosToken.getTokenCounter();
                  //   console.log({ happySvg, HAPPY_SVG_URI });
                  assert.equal(happySvg, HAPPY_SVG_URI);
                  assert.equal(sadSvg, SAD_SVG_URI);
                  assert.equal(priceFeedAddress, aggregatorV3.address);
                  assert.equal(tokenCounter.toString(), "0");
              });
          });

          describe("Mint SVG NFT", () => {
              it("Emits the NFT minted event", async () => {
                  const priceThreshold = ethers.utils.parseEther("2000");
                  await expect(svgHiosToken.mint(priceThreshold)).to.emit(
                      svgHiosToken,
                      "NftMinted"
                  );
              });
              it("Increases the token counter in one", async () => {
                  const priceThreshold = ethers.utils.parseEther("2000");
                  await svgHiosToken.mint(priceThreshold);
                  const tokenCounter = await svgHiosToken.getTokenCounter();
                  assert.equal(tokenCounter.toString(), "1");
              });
          });
          describe("Get Token URI minted", () => {
              it("reverts if the token does not exist", async () => {
                  const priceThreshold = ethers.utils.parseEther("2000");
                  console.log({ priceThreshold: priceThreshold.toString() });
                  await svgHiosToken.mint(priceThreshold);
                  const tokenCounter = await svgHiosToken.getTokenCounter();
                  await expect(
                      svgHiosToken.tokenURI(tokenCounter.add(1).toNumber())
                  ).to.be.revertedWith("Token does not exist");
              });
              it("Returns a Sad face NFT is the current price is lower than the threshold", async () => {
                  const { answer } = await aggregatorV3.latestRoundData();
                  //2000000000000000000000
                  //1724000000000000000001
                  const priceThreshold = answer.sub(1).toString();
                  const mint = await svgHiosToken.mint(priceThreshold);
                  await mint.wait(1);
                  const tokenCounter = await svgHiosToken.getTokenCounter();
                  console.log({ tokenCounter });
                  const tokenUri = await svgHiosToken.tokenURI(1);
                  console.log({ priceThreshold, tokenUri });
                  assert.equal(tokenUri, HAPPY_TOKEN_URI);
              });
          });
      });
