import { deployments, ethers, network } from "hardhat";
import { developmentChains } from "../hardhat.config.helper";
import { AggregatorInterface, AggregatorV3Interface, SvgHiosToken } from "../typechain-types";
import { assert, expect } from "chai";
const SAD_SVG_URI =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzEiIGhlaWdodD0iMzEiIHZpZXdCb3g9IjAgMCAzMSAzMSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEzLjIxMSAxOUMxMi40MDI0IDIwLjE3NzQgMTEuMDY4MiAyMC45NDk2IDkuNTMxOTQgMjAuOTQ5NkM5LjA3OTEzIDIwLjk0OTYgOC42NDE5OSAyMC44ODI1IDguMjI5OTIgMjAuNzU3N0M4LjEzNjEzIDIwLjcyOTMgOC4wMzkxOCAyMC43OTggOC4wMzkxOCAyMC44OTZDOC4wMzkxOCAyMS41MDU3IDcuNTQ0OSAyMiA2LjkzNTE4IDIyQzYuMzI1NDYgMjIgNS44MzExOCAyMS41MDU3IDUuODMxMTggMjAuODk2TDUuODMxMTggMjBDNS44MzExNyAxOS40NDc3IDYuMjc4ODkgMTkgNi44MzExOCAxOUgxMy4yMTFaIiBmaWxsPSIjMjEyMTIxIi8+CjxwYXRoIGQ9Ik0xNi43NTA1IDE5QzE3LjU1OTEgMjAuMTc3NCAxOC44OTMzIDIwLjk0OTYgMjAuNDI5NSAyMC45NDk2QzIwLjg4MjMgMjAuOTQ5NiAyMS4zMTk1IDIwLjg4MjUgMjEuNzMxNSAyMC43NTc3QzIxLjgyNTMgMjAuNzI5MyAyMS45MjIzIDIwLjc5OCAyMS45MjIzIDIwLjg5NkMyMS45MjIzIDIxLjUwNTcgMjIuNDE2NiAyMiAyMy4wMjYzIDIyQzIzLjYzNiAyMiAyNC4xMzAzIDIxLjUwNTcgMjQuMTMwMyAyMC44OTZMMjQuMTMwMyAyMEMyNC4xMzAzIDE5LjQ0NzcgMjMuNjgyNiAxOSAyMy4xMzAzIDE5SDE2Ljc1MDVaIiBmaWxsPSIjMjEyMTIxIi8+CjxwYXRoIGQ9Ik05LjAxNTY0IDcuNDAzODZMOS4wMTg4NCA3LjM4NzYzQzkuMDY0NDggNy4xMTU1MyA5LjMyMTg2IDYuOTMyMjMgOS41OTQwOCA2Ljk3NzZDOS44NjY0NiA3LjAyMjk5IDEwLjA1MDUgNy4yODA2MSAxMC4wMDUxIDcuNTUyOTlMOS41MTE4OCA3LjQ3MDc5QzEwLjAwNTEgNy41NTI5OSAxMC4wMDQ5IDcuNTU0MjMgMTAuMDA0OSA3LjU1NDIzTDEwLjAwNDYgNy41NTU3NEwxMC4wMDM5IDcuNTU5NkwxMC4wMDE5IDcuNTcwNkMxMC4wMDAzIDcuNTc5MzYgOS45OTgwOSA3LjU5MDk2IDkuOTk1MTYgNy42MDUyMUM5Ljk4OTMgNy42MzM2OSA5Ljk4MDY3IDcuNjcyODQgOS45Njg1OSA3LjcyMTE1QzkuOTQ0NDcgNy44MTc2MyA5LjkwNjQ1IDcuOTUxMzcgOS44NDkxNiA4LjExMDAyQzkuNzM1MDEgOC40MjYxMSA5LjU0MTcgOC44NDg1MiA5LjIyMzQyIDkuMjcyODlDOC41NzM1NSAxMC4xMzk0IDcuNDI4NzQgMTAuOTc1IDUuNTA2MjkgMTAuOTc1QzUuMjMwMTQgMTAuOTc1IDUuMDA2MjkgMTAuNzUxMSA1LjAwNjI5IDEwLjQ3NUM1LjAwNjI5IDEwLjE5ODggNS4yMzAxNCA5Ljk3NDk5IDUuNTA2MjkgOS45NzQ5OUM3LjA4ODczIDkuOTc0OTkgNy45NDY3MSA5LjMwODQ5IDguNDIzNDIgOC42NzI4OUM4LjY2ODQyIDguMzQ2MjIgOC44MTkzNCA4LjAxNzU3IDguOTA4NiA3Ljc3MDM4QzguOTUzMDIgNy42NDczOCA4Ljk4MTQ5IDcuNTQ2NDIgOC45OTg0NSA3LjQ3ODYxQzkuMDA2OTEgNy40NDQ3NyA5LjAxMjQ1IDcuNDE5MzggOS4wMTU2NCA3LjQwMzg2WiIgZmlsbD0iIzIxMjEyMSIvPgo8cGF0aCBkPSJNMjEuMDIzNSA3LjQwMzg2TDIxLjAyMDQgNy4zODgyM0wyMS4wMjAxIDcuMzg2OTNDMjAuOTc0IDcuMTE1NDYgMjAuNzE2OSA2LjkzMjI5IDIwLjQ0NSA2Ljk3NzZDMjAuMTcyNiA3LjAyMjk5IDE5Ljk4ODYgNy4yODA2MSAyMC4wMzQgNy41NTI5OUwyMC41MjcyIDcuNDcwNzlDMjAuMDM0IDcuNTUyOTkgMjAuMDM0MiA3LjU1NDIzIDIwLjAzNDIgNy41NTQyM0wyMC4wMzQ1IDcuNTU1NzRMMjAuMDM1MiA3LjU1OTZMMjAuMDM3MiA3LjU3MDZDMjAuMDM4OCA3LjU3OTM2IDIwLjA0MSA3LjU5MDk2IDIwLjA0MzkgNy42MDUyMUMyMC4wNDk4IDcuNjMzNjkgMjAuMDU4NCA3LjY3Mjg0IDIwLjA3MDUgNy43MjExNUMyMC4wOTQ2IDcuODE3NjMgMjAuMTMyNyA3Ljk1MTM3IDIwLjE5IDguMTEwMDJDMjAuMzA0MSA4LjQyNjExIDIwLjQ5NzQgOC44NDg1MiAyMC44MTU3IDkuMjcyODlDMjEuNDY1NiAxMC4xMzk0IDIyLjYxMDQgMTAuOTc1IDI0LjUzMjggMTAuOTc1QzI0LjgwOSAxMC45NzUgMjUuMDMyOCAxMC43NTExIDI1LjAzMjggMTAuNDc1QzI1LjAzMjggMTAuMTk4OCAyNC44MDkgOS45NzQ5OSAyNC41MzI4IDkuOTc0OTlDMjIuOTUwNCA5Ljk3NDk5IDIyLjA5MjQgOS4zMDg0OSAyMS42MTU3IDguNjcyODlDMjEuMzcwNyA4LjM0NjIyIDIxLjIxOTggOC4wMTc1NyAyMS4xMzA1IDcuNzcwMzhDMjEuMDg2MSA3LjY0NzM4IDIxLjA1NzYgNy41NDY0MiAyMS4wNDA3IDcuNDc4NjFDMjEuMDMyMiA3LjQ0NDc3IDIxLjAyNjcgNy40MTkzOCAyMS4wMjM1IDcuNDAzODZaIiBmaWxsPSIjMjEyMTIxIi8+CjxwYXRoIGQ9Ik0xMi41MTcxIDIyLjQzNTFDMTIuMjA5MiAyMi4xNTggMTEuNzM1IDIyLjE4MyAxMS40NTc5IDIyLjQ5MDhDMTEuMTgwOCAyMi43OTg3IDExLjIwNTggMjMuMjcyOSAxMS41MTM3IDIzLjU1QzEyLjQzOTcgMjQuMzgzNSAxMy43NjQ5IDI0Ljc1NjUgMTUuMDE5NiAyNC43NTY1QzE2LjI3NDMgMjQuNzU2NSAxNy41OTk0IDI0LjM4MzUgMTguNTI1NSAyMy41NUMxOC44MzM0IDIzLjI3MjkgMTguODU4MyAyMi43OTg3IDE4LjU4MTIgMjIuNDkwOEMxOC4zMDQxIDIyLjE4MyAxNy44Mjk5IDIyLjE1OCAxNy41MjIgMjIuNDM1MUMxNi45NDYgMjIuOTUzNSAxNi4wMTggMjMuMjU2NSAxNS4wMTk2IDIzLjI1NjVDMTQuMDIxMSAyMy4yNTY1IDEzLjA5MzIgMjIuOTUzNSAxMi41MTcxIDIyLjQzNTFaIiBmaWxsPSIjMjEyMTIxIi8+CjxwYXRoIGQ9Ik0xMy44MTY4IDE2LjI4NDZDMTMuODE2OCAxNi45MDM2IDEzLjY2NDggMTcuNDg3MiAxMy4zOTYxIDE4SDYuODM1MTJDNi41NjY0MSAxNy40ODcyIDYuNDE0NDIgMTYuOTAzNiA2LjQxNDQyIDE2LjI4NDZDNi40MTQ0MiAxNC4yNDA1IDguMDcxNDkgMTIuNTgzNCAxMC4xMTU2IDEyLjU4MzRDMTIuMTU5NyAxMi41ODM0IDEzLjgxNjggMTQuMjQwNSAxMy44MTY4IDE2LjI4NDZaTTEyLjUyODkgMTYuMzM5MkMxMy4wNzUgMTUuOTYxNCAxMy4xNDI5IDE1LjExMzIgMTIuNjgwNCAxNC40NDQ3QzEyLjIxOCAxMy43NzYyIDExLjQwMDMgMTMuNTQwNiAxMC44NTQxIDEzLjkxODRDMTAuMzA4IDE0LjI5NjMgMTAuMjQwMSAxNS4xNDQ1IDEwLjcwMjYgMTUuODEzQzExLjE2NTEgMTYuNDgxNCAxMS45ODI3IDE2LjcxNzEgMTIuNTI4OSAxNi4zMzkyWiIgZmlsbD0iIzIxMjEyMSIvPgo8cGF0aCBkPSJNMTYuNTY1MyAxOEgyMy4xMjYzQzIzLjM5NSAxNy40ODcyIDIzLjU0NyAxNi45MDM2IDIzLjU0NyAxNi4yODQ2QzIzLjU0NyAxNC4yNDA1IDIxLjg4OTkgMTIuNTgzNCAxOS44NDU4IDEyLjU4MzRDMTcuODAxNyAxMi41ODM0IDE2LjE0NDYgMTQuMjQwNSAxNi4xNDQ2IDE2LjI4NDZDMTYuMTQ0NiAxNi45MDM2IDE2LjI5NjYgMTcuNDg3MiAxNi41NjUzIDE4Wk0yMi4wMTExIDE2LjMzOTJDMjEuNDY0OSAxNi43MTcxIDIwLjY0NzMgMTYuNDgxNCAyMC4xODQ4IDE1LjgxM0MxOS43MjIzIDE1LjE0NDUgMTkuNzkwMiAxNC4yOTYzIDIwLjMzNjMgMTMuOTE4NEMyMC44ODI1IDEzLjU0MDYgMjEuNzAwMSAxMy43NzYyIDIyLjE2MjYgMTQuNDQ0N0MyMi42MjUxIDE1LjExMzIgMjIuNTU3MiAxNS45NjE0IDIyLjAxMTEgMTYuMzM5MloiIGZpbGw9IiMyMTIxMjEiLz4KPHBhdGggZD0iTTMuNzY4MzEgNS4zOTEzOEM2LjMyMTE1IDIuNjE5MjcgMTAuMTA4MiAwLjk2Mjg5MSAxNS4wMTg0IDAuOTYyODkxQzE5LjkyODcgMC45NjI4OTEgMjMuNzE1NyAyLjYxOTI3IDI2LjI2ODYgNS4zOTEzOEMyOC44MDkgOC4xNTAwMSAzMC4wMzY5IDExLjkxNDggMzAuMDM2OSAxNS45ODEzQzMwLjAzNjkgMjAuMDQ3OSAyOC44MDkgMjMuODEyNyAyNi4yNjg2IDI2LjU3MTNDMjMuNzE1NyAyOS4zNDM0IDE5LjkyODcgMzAuOTk5OCAxNS4wMTg0IDMwLjk5OThDMTAuMTA4MiAzMC45OTk4IDYuMzIxMTUgMjkuMzQzNCAzLjc2ODMxIDI2LjU3MTNDMS4yMjc4OSAyMy44MTI3IDAgMjAuMDQ3OSAwIDE1Ljk4MTNDMCAxMS45MTQ4IDEuMjI3ODkgOC4xNTAwMSAzLjc2ODMxIDUuMzkxMzhaTTUuMjM5NTEgNi43NDYyMUMzLjEwNzU4IDkuMDYxMjcgMiAxMi4zMDU3IDIgMTUuOTgxM0MyIDE5LjY1NyAzLjEwNzU4IDIyLjkwMTQgNS4yMzk1MSAyNS4yMTY1QzcuMzU5MDMgMjcuNTE4IDEwLjU4MTIgMjguOTk5OCAxNS4wMTg0IDI4Ljk5OThDMTkuNDU1NyAyOC45OTk4IDIyLjY3NzkgMjcuNTE4IDI0Ljc5NzQgMjUuMjE2NUMyNi45MjkzIDIyLjkwMTQgMjguMDM2OSAxOS42NTcgMjguMDM2OSAxNS45ODEzQzI4LjAzNjkgMTIuMzA1NyAyNi45MjkzIDkuMDYxMjcgMjQuNzk3NCA2Ljc0NjIxQzIyLjY3NzkgNC40NDQ2NCAxOS40NTU3IDIuOTYyODkgMTUuMDE4NCAyLjk2Mjg5QzEwLjU4MTIgMi45NjI4OSA3LjM1OTAzIDQuNDQ0NjQgNS4yMzk1MSA2Ljc0NjIxWiIgZmlsbD0iIzIxMjEyMSIvPgo8L3N2Zz4K";
const SAD_TOKEN_URI =
    "data:application/json;base64,eyJuYW1lOiI6IlNWRyBIaW9zIFRva2VuIiwiZGVzY3JpcHRpb24iOiJBbmQgTkZUIHRoYXQgY2hhbmdlcyBiZXNlZCBvbiB0aGUgRXRoIHByaWNlIiwiYXR0cmlidXRlcyI6W3sidHJhaXRfdHlwZSI6ImNvb2xuZXNzIiwidmFsdWUiOjEwMH1dLCJpbWFnZSI6ImRhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsUEhOMlp5QjNhV1IwYUQwaU16RWlJR2hsYVdkb2REMGlNekVpSUhacFpYZENiM2c5SWpBZ01DQXpNU0F6TVNJZ1ptbHNiRDBpYm05dVpTSWdlRzFzYm5NOUltaDBkSEE2THk5M2QzY3Vkek11YjNKbkx6SXdNREF2YzNabklqNEtQSEJoZEdnZ1pEMGlUVEV6TGpJeE1TQXhPVU14TWk0ME1ESTBJREl3TGpFM056UWdNVEV1TURZNE1pQXlNQzQ1TkRrMklEa3VOVE14T1RRZ01qQXVPVFE1TmtNNUxqQTNPVEV6SURJd0xqazBPVFlnT0M0Mk5ERTVPU0F5TUM0NE9ESTFJRGd1TWpJNU9USWdNakF1TnpVM04wTTRMakV6TmpFeklESXdMamN5T1RNZ09DNHdNemt4T0NBeU1DNDNPVGdnT0M0d016a3hPQ0F5TUM0NE9UWkRPQzR3TXpreE9DQXlNUzQxTURVM0lEY3VOVFEwT1NBeU1pQTJMamt6TlRFNElESXlRell1TXpJMU5EWWdNaklnTlM0NE16RXhPQ0F5TVM0MU1EVTNJRFV1T0RNeE1UZ2dNakF1T0RrMlREVXVPRE14TVRnZ01qQkROUzQ0TXpFeE55QXhPUzQwTkRjM0lEWXVNamM0T0RrZ01Ua2dOaTQ0TXpFeE9DQXhPVWd4TXk0eU1URmFJaUJtYVd4c1BTSWpNakV5TVRJeElpOCtDanh3WVhSb0lHUTlJazB4Tmk0M05UQTFJREU1UXpFM0xqVTFPVEVnTWpBdU1UYzNOQ0F4T0M0NE9UTXpJREl3TGprME9UWWdNakF1TkRJNU5TQXlNQzQ1TkRrMlF6SXdMamc0TWpNZ01qQXVPVFE1TmlBeU1TNHpNVGsxSURJd0xqZzRNalVnTWpFdU56TXhOU0F5TUM0M05UYzNRekl4TGpneU5UTWdNakF1TnpJNU15QXlNUzQ1TWpJeklESXdMamM1T0NBeU1TNDVNakl6SURJd0xqZzVOa015TVM0NU1qSXpJREl4TGpVd05UY2dNakl1TkRFMk5pQXlNaUF5TXk0d01qWXpJREl5UXpJekxqWXpOaUF5TWlBeU5DNHhNekF6SURJeExqVXdOVGNnTWpRdU1UTXdNeUF5TUM0NE9UWk1NalF1TVRNd015QXlNRU15TkM0eE16QXpJREU1TGpRME56Y2dNak11TmpneU5pQXhPU0F5TXk0eE16QXpJREU1U0RFMkxqYzFNRFZhSWlCbWFXeHNQU0lqTWpFeU1USXhJaTgrQ2p4d1lYUm9JR1E5SWswNUxqQXhOVFkwSURjdU5EQXpPRFpNT1M0d01UZzROQ0EzTGpNNE56WXpRemt1TURZME5EZ2dOeTR4TVRVMU15QTVMak15TVRnMklEWXVPVE15TWpNZ09TNDFPVFF3T0NBMkxqazNOelpET1M0NE5qWTBOaUEzTGpBeU1qazVJREV3TGpBMU1EVWdOeTR5T0RBMk1TQXhNQzR3TURVeElEY3VOVFV5T1RsTU9TNDFNVEU0T0NBM0xqUTNNRGM1UXpFd0xqQXdOVEVnTnk0MU5USTVPU0F4TUM0d01EUTVJRGN1TlRVME1qTWdNVEF1TURBME9TQTNMalUxTkRJelRERXdMakF3TkRZZ055NDFOVFUzTkV3eE1DNHdNRE01SURjdU5UVTVOa3d4TUM0d01ERTVJRGN1TlRjd05rTXhNQzR3TURBeklEY3VOVGM1TXpZZ09TNDVPVGd3T1NBM0xqVTVNRGsySURrdU9UazFNVFlnTnk0Mk1EVXlNVU01TGprNE9UTWdOeTQyTXpNMk9TQTVMams0TURZM0lEY3VOamN5T0RRZ09TNDVOamcxT1NBM0xqY3lNVEUxUXprdU9UUTBORGNnTnk0NE1UYzJNeUE1TGprd05qUTFJRGN1T1RVeE16Y2dPUzQ0TkRreE5pQTRMakV4TURBeVF6a3VOek0xTURFZ09DNDBNall4TVNBNUxqVTBNVGNnT0M0NE5EZzFNaUE1TGpJeU16UXlJRGt1TWpjeU9EbERPQzQxTnpNMU5TQXhNQzR4TXprMElEY3VOREk0TnpRZ01UQXVPVGMxSURVdU5UQTJNamtnTVRBdU9UYzFRelV1TWpNd01UUWdNVEF1T1RjMUlEVXVNREEyTWprZ01UQXVOelV4TVNBMUxqQXdOakk1SURFd0xqUTNOVU0xTGpBd05qSTVJREV3TGpFNU9EZ2dOUzR5TXpBeE5DQTVMamszTkRrNUlEVXVOVEEyTWprZ09TNDVOelE1T1VNM0xqQTRPRGN6SURrdU9UYzBPVGtnTnk0NU5EWTNNU0E1TGpNd09EUTVJRGd1TkRJek5ESWdPQzQyTnpJNE9VTTRMalkyT0RReUlEZ3VNelEyTWpJZ09DNDRNVGt6TkNBNExqQXhOelUzSURndU9UQTROaUEzTGpjM01ETTRRemd1T1RVek1ESWdOeTQyTkRjek9DQTRMams0TVRRNUlEY3VOVFEyTkRJZ09DNDVPVGcwTlNBM0xqUTNPRFl4UXprdU1EQTJPVEVnTnk0ME5EUTNOeUE1TGpBeE1qUTFJRGN1TkRFNU16Z2dPUzR3TVRVMk5DQTNMalF3TXpnMldpSWdabWxzYkQwaUl6SXhNakV5TVNJdlBnbzhjR0YwYUNCa1BTSk5NakV1TURJek5TQTNMalF3TXpnMlRESXhMakF5TURRZ055NHpPRGd5TTB3eU1TNHdNakF4SURjdU16ZzJPVE5ETWpBdU9UYzBJRGN1TVRFMU5EWWdNakF1TnpFMk9TQTJMamt6TWpJNUlESXdMalEwTlNBMkxqazNOelpETWpBdU1UY3lOaUEzTGpBeU1qazVJREU1TGprNE9EWWdOeTR5T0RBMk1TQXlNQzR3TXpRZ055NDFOVEk1T1V3eU1DNDFNamN5SURjdU5EY3dOemxETWpBdU1ETTBJRGN1TlRVeU9Ua2dNakF1TURNME1pQTNMalUxTkRJeklESXdMakF6TkRJZ055NDFOVFF5TTB3eU1DNHdNelExSURjdU5UVTFOelJNTWpBdU1ETTFNaUEzTGpVMU9UWk1NakF1TURNM01pQTNMalUzTURaRE1qQXVNRE00T0NBM0xqVTNPVE0ySURJd0xqQTBNU0EzTGpVNU1EazJJREl3TGpBME16a2dOeTQyTURVeU1VTXlNQzR3TkRrNElEY3VOak16TmprZ01qQXVNRFU0TkNBM0xqWTNNamcwSURJd0xqQTNNRFVnTnk0M01qRXhOVU15TUM0d09UUTJJRGN1T0RFM05qTWdNakF1TVRNeU55QTNMamsxTVRNM0lESXdMakU1SURndU1URXdNREpETWpBdU16QTBNU0E0TGpReU5qRXhJREl3TGpRNU56UWdPQzQ0TkRnMU1pQXlNQzQ0TVRVM0lEa3VNamN5T0RsRE1qRXVORFkxTmlBeE1DNHhNemswSURJeUxqWXhNRFFnTVRBdU9UYzFJREkwTGpVek1qZ2dNVEF1T1RjMVF6STBMamd3T1NBeE1DNDVOelVnTWpVdU1ETXlPQ0F4TUM0M05URXhJREkxTGpBek1qZ2dNVEF1TkRjMVF6STFMakF6TWpnZ01UQXVNVGs0T0NBeU5DNDRNRGtnT1M0NU56UTVPU0F5TkM0MU16STRJRGt1T1RjME9UbERNakl1T1RVd05DQTVMamszTkRrNUlESXlMakE1TWpRZ09TNHpNRGcwT1NBeU1TNDJNVFUzSURndU5qY3lPRGxETWpFdU16Y3dOeUE0TGpNME5qSXlJREl4TGpJeE9UZ2dPQzR3TVRjMU55QXlNUzR4TXpBMUlEY3VOemN3TXpoRE1qRXVNRGcyTVNBM0xqWTBOek00SURJeExqQTFOellnTnk0MU5EWTBNaUF5TVM0d05EQTNJRGN1TkRjNE5qRkRNakV1TURNeU1pQTNMalEwTkRjM0lESXhMakF5TmpjZ055NDBNVGt6T0NBeU1TNHdNak0xSURjdU5EQXpPRFphSWlCbWFXeHNQU0lqTWpFeU1USXhJaTgrQ2p4d1lYUm9JR1E5SWsweE1pNDFNVGN4SURJeUxqUXpOVEZETVRJdU1qQTVNaUF5TWk0eE5UZ2dNVEV1TnpNMUlESXlMakU0TXlBeE1TNDBOVGM1SURJeUxqUTVNRGhETVRFdU1UZ3dPQ0F5TWk0M09UZzNJREV4TGpJd05UZ2dNak11TWpjeU9TQXhNUzQxTVRNM0lESXpMalUxUXpFeUxqUXpPVGNnTWpRdU16Z3pOU0F4TXk0M05qUTVJREkwTGpjMU5qVWdNVFV1TURFNU5pQXlOQzQzTlRZMVF6RTJMakkzTkRNZ01qUXVOelUyTlNBeE55NDFPVGswSURJMExqTTRNelVnTVRndU5USTFOU0F5TXk0MU5VTXhPQzQ0TXpNMElESXpMakkzTWprZ01UZ3VPRFU0TXlBeU1pNDNPVGczSURFNExqVTRNVElnTWpJdU5Ea3dPRU14T0M0ek1EUXhJREl5TGpFNE15QXhOeTQ0TWprNUlESXlMakUxT0NBeE55NDFNaklnTWpJdU5ETTFNVU14Tmk0NU5EWWdNakl1T1RVek5TQXhOaTR3TVRnZ01qTXVNalUyTlNBeE5TNHdNVGsySURJekxqSTFOalZETVRRdU1ESXhNU0F5TXk0eU5UWTFJREV6TGpBNU16SWdNakl1T1RVek5TQXhNaTQxTVRjeElESXlMalF6TlRGYUlpQm1hV3hzUFNJak1qRXlNVEl4SWk4K0NqeHdZWFJvSUdROUlrMHhNeTQ0TVRZNElERTJMakk0TkRaRE1UTXVPREUyT0NBeE5pNDVNRE0ySURFekxqWTJORGdnTVRjdU5EZzNNaUF4TXk0ek9UWXhJREU0U0RZdU9ETTFNVEpETmk0MU5qWTBNU0F4Tnk0ME9EY3lJRFl1TkRFME5ESWdNVFl1T1RBek5pQTJMalF4TkRReUlERTJMakk0TkRaRE5pNDBNVFEwTWlBeE5DNHlOREExSURndU1EY3hORGtnTVRJdU5UZ3pOQ0F4TUM0eE1UVTJJREV5TGpVNE16UkRNVEl1TVRVNU55QXhNaTQxT0RNMElERXpMamd4TmpnZ01UUXVNalF3TlNBeE15NDRNVFk0SURFMkxqSTRORFphVFRFeUxqVXlPRGtnTVRZdU16TTVNa014TXk0d056VWdNVFV1T1RZeE5DQXhNeTR4TkRJNUlERTFMakV4TXpJZ01USXVOamd3TkNBeE5DNDBORFEzUXpFeUxqSXhPQ0F4TXk0M056WXlJREV4TGpRd01ETWdNVE11TlRRd05pQXhNQzQ0TlRReElERXpMamt4T0RSRE1UQXVNekE0SURFMExqSTVOak1nTVRBdU1qUXdNU0F4TlM0eE5EUTFJREV3TGpjd01qWWdNVFV1T0RFelF6RXhMakUyTlRFZ01UWXVORGd4TkNBeE1TNDVPREkzSURFMkxqY3hOekVnTVRJdU5USTRPU0F4Tmk0ek16a3lXaUlnWm1sc2JEMGlJekl4TWpFeU1TSXZQZ284Y0dGMGFDQmtQU0pOTVRZdU5UWTFNeUF4T0VneU15NHhNall6UXpJekxqTTVOU0F4Tnk0ME9EY3lJREl6TGpVME55QXhOaTQ1TURNMklESXpMalUwTnlBeE5pNHlPRFEyUXpJekxqVTBOeUF4TkM0eU5EQTFJREl4TGpnNE9Ua2dNVEl1TlRnek5DQXhPUzQ0TkRVNElERXlMalU0TXpSRE1UY3VPREF4TnlBeE1pNDFPRE0wSURFMkxqRTBORFlnTVRRdU1qUXdOU0F4Tmk0eE5EUTJJREUyTGpJNE5EWkRNVFl1TVRRME5pQXhOaTQ1TURNMklERTJMakk1TmpZZ01UY3VORGczTWlBeE5pNDFOalV6SURFNFdrMHlNaTR3TVRFeElERTJMak16T1RKRE1qRXVORFkwT1NBeE5pNDNNVGN4SURJd0xqWTBOek1nTVRZdU5EZ3hOQ0F5TUM0eE9EUTRJREUxTGpneE0wTXhPUzQzTWpJeklERTFMakUwTkRVZ01Ua3VOemt3TWlBeE5DNHlPVFl6SURJd0xqTXpOak1nTVRNdU9URTRORU15TUM0NE9ESTFJREV6TGpVME1EWWdNakV1TnpBd01TQXhNeTQzTnpZeUlESXlMakUyTWpZZ01UUXVORFEwTjBNeU1pNDJNalV4SURFMUxqRXhNeklnTWpJdU5UVTNNaUF4TlM0NU5qRTBJREl5TGpBeE1URWdNVFl1TXpNNU1sb2lJR1pwYkd3OUlpTXlNVEl4TWpFaUx6NEtQSEJoZEdnZ1pEMGlUVE11TnpZNE16RWdOUzR6T1RFek9FTTJMak15TVRFMUlESXVOakU1TWpjZ01UQXVNVEE0TWlBd0xqazJNamc1TVNBeE5TNHdNVGcwSURBdU9UWXlPRGt4UXpFNUxqa3lPRGNnTUM0NU5qSTRPVEVnTWpNdU56RTFOeUF5TGpZeE9USTNJREkyTGpJMk9EWWdOUzR6T1RFek9FTXlPQzQ0TURrZ09DNHhOVEF3TVNBek1DNHdNelk1SURFeExqa3hORGdnTXpBdU1ETTJPU0F4TlM0NU9ERXpRek13TGpBek5qa2dNakF1TURRM09TQXlPQzQ0TURrZ01qTXVPREV5TnlBeU5pNHlOamcySURJMkxqVTNNVE5ETWpNdU56RTFOeUF5T1M0ek5ETTBJREU1TGpreU9EY2dNekF1T1RrNU9DQXhOUzR3TVRnMElETXdMams1T1RoRE1UQXVNVEE0TWlBek1DNDVPVGs0SURZdU16SXhNVFVnTWprdU16UXpOQ0F6TGpjMk9ETXhJREkyTGpVM01UTkRNUzR5TWpjNE9TQXlNeTQ0TVRJM0lEQWdNakF1TURRM09TQXdJREUxTGprNE1UTkRNQ0F4TVM0NU1UUTRJREV1TWpJM09Ea2dPQzR4TlRBd01TQXpMamMyT0RNeElEVXVNemt4TXpoYVRUVXVNak01TlRFZ05pNDNORFl5TVVNekxqRXdOelU0SURrdU1EWXhNamNnTWlBeE1pNHpNRFUzSURJZ01UVXVPVGd4TTBNeUlERTVMalkxTnlBekxqRXdOelU0SURJeUxqa3dNVFFnTlM0eU16azFNU0F5TlM0eU1UWTFRemN1TXpVNU1ETWdNamN1TlRFNElERXdMalU0TVRJZ01qZ3VPVGs1T0NBeE5TNHdNVGcwSURJNExqazVPVGhETVRrdU5EVTFOeUF5T0M0NU9UazRJREl5TGpZM056a2dNamN1TlRFNElESTBMamM1TnpRZ01qVXVNakUyTlVNeU5pNDVNamt6SURJeUxqa3dNVFFnTWpndU1ETTJPU0F4T1M0Mk5UY2dNamd1TURNMk9TQXhOUzQ1T0RFelF6STRMakF6TmprZ01USXVNekExTnlBeU5pNDVNamt6SURrdU1EWXhNamNnTWpRdU56azNOQ0EyTGpjME5qSXhRekl5TGpZM056a2dOQzQwTkRRMk5DQXhPUzQwTlRVM0lESXVPVFl5T0RrZ01UVXVNREU0TkNBeUxqazJNamc1UXpFd0xqVTRNVElnTWk0NU5qSTRPU0EzTGpNMU9UQXpJRFF1TkRRME5qUWdOUzR5TXprMU1TQTJMamMwTmpJeFdpSWdabWxzYkQwaUl6SXhNakV5TVNJdlBnbzhMM04yWno0SyJ9";
const HAPPY_TOKEN_URI =
    "data:application/json;base64,eyJuYW1lOiI6IlNWRyBIaW9zIFRva2VuIiwiZGVzY3JpcHRpb24iOiJBbmQgTkZUIHRoYXQgY2hhbmdlcyBiZXNlZCBvbiB0aGUgRXRoIHByaWNlIiwiYXR0cmlidXRlcyI6W3sidHJhaXRfdHlwZSI6ImNvb2xuZXNzIiwidmFsdWUiOjEwMH1dLCJpbWFnZSI6ImRhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsUEhOMlp5QjNhV1IwYUQwaU16SWlJR2hsYVdkb2REMGlNeklpSUhacFpYZENiM2c5SWpBZ01DQXpNaUF6TWlJZ1ptbHNiRDBpYm05dVpTSWdlRzFzYm5NOUltaDBkSEE2THk5M2QzY3Vkek11YjNKbkx6SXdNREF2YzNabklqNEtQSEJoZEdnZ1pEMGlUVEUxTGprNU9Ea2dNME14T0M0ek9ESTJJRE1nTWpBdU5ERTFJRE11TkRJNE1qSWdNakl1TVRFek55QTBMakU0TVRjelRESXpMakl6TXprZ01pNDJPRGd5TkVNeU15NHlOekExSURJdU5qTTVOREVnTWpNdU16QTRPQ0F5TGpVNU16TWdNak11TXpRNE5TQXlMalUwT1RnM1F6SXhMakk0TmpZZ01TNDFOVEV5TkNBeE9DNDRNamsySURFZ01UVXVPVGs0T1NBeFF6RXpMakUyT0RrZ01TQXhNQzQzTVRJMElERXVOVFV3T1RVZ09DNDJOVEE0TkNBeUxqVTBPVEE1UXpndU5qa3dPRGNnTWk0MU9USTNOQ0E0TGpjeU9UUWdNaTQyTXpreE1TQTRMamMyTmpJMUlESXVOamc0TWpSTU9TNDRPRFUzT0NBMExqRTRNRGsxUXpFeExqVTRORElnTXk0ME1qYzVNeUF4TXk0Mk1UWWdNeUF4TlM0NU9UZzVJRE5hSWlCbWFXeHNQU0lqTWpFeU1USXhJaTgrQ2p4d1lYUm9JR1E5SWsweklERTFMams1T0RsRE15QXhOQzQwTXpZNUlETXVNakF3TXpFZ01USXVPVFV5T1NBekxqVTVORFV4SURFeExqVTROVE5NTVM0NE9UTXpPU0F4TUM0Mk5EQXlRekV1T0RZek9UVWdNVEF1TmpJek9TQXhMamd6TlRJMUlERXdMall3TmprZ01TNDRNRGN5T0NBeE1DNDFPRGswUXpFdU1qWTJNalFnTVRJdU1qYzVOeUF4SURFMExqRXdOallnTVNBeE5TNDVPVGc1UXpFZ01qQXVNRFlnTWk0eU1qWXlOaUF5TXk0NE1UazVJRFF1TnpZek5ESWdNall1TlRjMVF6Y3VNekV6SURJNUxqTTBNellnTVRFdU1EazFNaUF6TUM0NU9UYzRJREUxTGprNU9Ea2dNekF1T1RrM09FTXlNQzQ1TURJMklETXdMams1TnpnZ01qUXVOamcwT0NBeU9TNHpORE0ySURJM0xqSXpORE1nTWpZdU5UYzFRekk1TGpjM01UVWdNak11T0RFNU9TQXpNQzQ1T1RjNElESXdMakEySURNd0xqazVOemdnTVRVdU9UazRPVU16TUM0NU9UYzRJREUwTGpFd055QXpNQzQzTXpFM0lERXlMakk0TURZZ016QXVNVGt3T1NBeE1DNDFPVEEyUXpNd0xqRTJNelVnTVRBdU5qQTNOeUF6TUM0eE16VTFJREV3TGpZeU5ETWdNekF1TVRBMk55QXhNQzQyTkRBeVRESTRMalF3TXpZZ01URXVOVGcyTkVNeU9DNDNPVGMySURFeUxqazFNemNnTWpndU9UazNPQ0F4TkM0ME16Y3pJREk0TGprNU56Z2dNVFV1T1RrNE9VTXlPQzQ1T1RjNElERTVMalkyT1RFZ01qY3VPRGt4T0NBeU1pNDVNRGczSURJMUxqYzJNekVnTWpVdU1qSXdNa015TXk0Mk5EWTVJREkzTGpVeE9ESWdNakF1TkRJNU5pQXlPQzQ1T1RjNElERTFMams1T0RrZ01qZ3VPVGszT0VNeE1TNDFOamd4SURJNExqazVOemdnT0M0ek5UQTRPQ0F5Tnk0MU1UZ3lJRFl1TWpNME5qSWdNalV1TWpJd01rTTBMakV3TlRrMUlESXlMamt3T0RjZ015QXhPUzQyTmpreElETWdNVFV1T1RrNE9Wb2lJR1pwYkd3OUlpTXlNVEl4TWpFaUx6NEtQSEJoZEdnZ1pEMGlUVGd1TnpjM05EVWdNVFF1TURZeVREVXVOekkzTXpRZ01UWXVORE0wTTBNMUxqUTFNVEUxSURFMkxqWTBPVEVnTlM0d05URTNNeUF4Tmk0ME16QTRJRFV1TURnek5ERWdNVFl1TURneU0wdzFMak00TWpBNElERXlMamM1TmpsRE5TNDBOVE0zTmlBeE1pNHdNRGcxSURVdU1EVXpOak1nTVRFdU1qVXlJRFF1TXpZeE5UZ2dNVEF1T0RZM05Vd3lMak0zT0RrM0lEa3VOelkyTVVNeExqZ3lOalkxSURrdU5EVTVNalVnTVM0NE56Z3dNaUE0TGpZME9EYzRJREl1TkRZME5qWWdPQzQwTVRReE1rdzBMams1TkRBNElEY3VOREF5TXpWRE5TNDJNakUySURjdU1UVXhNelFnTmk0d056azVNU0EyTGpZd01ETTRJRFl1TWpFeU5EWWdOUzQ1TXpjMk0wdzJMalk0TkRFM0lETXVOVGM1TURaRE5pNDRNRFl5TXlBeUxqazJPRGM1SURjdU5Ua3lOemNnTWk0M09UQXpOeUEzTGprMk5qRTVJRE11TWpnNE1qWk1PUzR6TXpBek55QTFMakV3TnpFMlF6a3VOelEyTlRjZ05TNDJOakl4TVNBeE1DNDBNakEySURVdU9UWXhOelVnTVRFdU1URXhOQ0ExTGpnNU9EazFUREUwTGpZd016a2dOUzQxT0RFME5VTXhOQzQ1TkRrZ05TNDFOVEF3T0NBeE5TNHhOamd4SURVdU9UUXlOVFlnTVRRdU9UWXdNU0EyTGpJeE9UZ3hUREV6TGpFM05EUWdPQzQyTURBNFF6RXlMamMxTlRZZ09TNHhOVGt4T1NBeE1pNDJOVGd5SURrdU9EazFOVElnTVRJdU9URTNOQ0F4TUM0MU5ETTJUREUwTGpNeU9EWWdNVFF1TURjeE5VTXhOQzQwTURJeklERTBMakkxTlRnZ01UUXVNalF5TVNBeE5DNDBORGcwSURFMExqQTBOelFnTVRRdU5EQTVOVXd4TUM0ek9UYzJJREV6TGpZM09UVkRPUzQ0TWpjMk1TQXhNeTQxTmpVMUlEa3VNak0yTWpZZ01UTXVOekExTVNBNExqYzNOelExSURFMExqQTJNbG9pSUdacGJHdzlJaU15TVRJeE1qRWlMejRLUEhCaGRHZ2daRDBpVFRjZ01UZEROeUF4TnlBM0lESTJJREUySURJMlF6STFJREkySURJMUlERTNJREkxSURFM1NEZGFJaUJtYVd4c1BTSWpNakV5TVRJeElpOCtDanh3WVhSb0lHUTlJazB5TXk0eU1qSTFJREUwTGpBMk1rd3lOaTR5TnpJM0lERTJMalF6TkRORE1qWXVOVFE0T0NBeE5pNDJORGt4SURJMkxqazBPRE1nTVRZdU5ETXdPQ0F5Tmk0NU1UWTJJREUyTGpBNE1qTk1Nall1TmpFM09TQXhNaTQzT1RZNVF6STJMalUwTmpJZ01USXVNREE0TlNBeU5pNDVORFkwSURFeExqSTFNaUF5Tnk0Mk16ZzBJREV3TGpnMk56Vk1Namt1TmpJeElEa3VOelkyTVVNek1DNHhOek16SURrdU5EVTVNalVnTXpBdU1USXlJRGd1TmpRNE56Z2dNamt1TlRNMU15QTRMalF4TkRFeVRESTNMakF3TlRrZ055NDBNREl6TlVNeU5pNHpOemcwSURjdU1UVXhNelFnTWpVdU9USXdNU0EyTGpZd01ETTRJREkxTGpjNE56VWdOUzQ1TXpjMk0wd3lOUzR6TVRVNElETXVOVGM1TURaRE1qVXVNVGt6T0NBeUxqazJPRGM1SURJMExqUXdOeklnTWk0M09UQXpOeUF5TkM0d016TTRJRE11TWpnNE1qWk1Nakl1TmpZNU5pQTFMakV3TnpFMlF6SXlMakkxTXpRZ05TNDJOakl4TVNBeU1TNDFOemswSURVdU9UWXhOelVnTWpBdU9EZzROaUExTGpnNU9EazFUREUzTGpNNU5qRWdOUzQxT0RFME5VTXhOeTR3TlRFZ05TNDFOVEF3T0NBeE5pNDRNekU1SURVdU9UUXlOVFlnTVRjdU1ETTVPU0EyTGpJeE9UZ3hUREU0TGpneU5UWWdPQzQyTURBNFF6RTVMakkwTkRRZ09TNHhOVGt4T1NBeE9TNHpOREU0SURrdU9EazFOVElnTVRrdU1EZ3lOaUF4TUM0MU5ETTJUREUzTGpZM01UUWdNVFF1TURjeE5VTXhOeTQxT1RjM0lERTBMakkxTlRnZ01UY3VOelUzT1NBeE5DNDBORGcwSURFM0xqazFNallnTVRRdU5EQTVOVXd5TVM0Mk1ESTBJREV6TGpZM09UVkRNakl1TVRjeU5DQXhNeTQxTmpVMUlESXlMamMyTXpjZ01UTXVOekExTVNBeU15NHlNakkxSURFMExqQTJNbG9pSUdacGJHdzlJaU15TVRJeE1qRWlMejRLUEM5emRtYytDZz09In0=";
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

              it("Returns a Happy face NFT is the current price is greater or equal than the threshold", async () => {
                  const { answer } = await aggregatorV3.latestRoundData();
                  const priceOffset = 1;
                  const priceThreshold = answer.sub(priceOffset).toString();

                  const mint = await svgHiosToken.mint(priceThreshold);
                  await mint.wait(1);
                  const tokenUri = await svgHiosToken.tokenURI(1);
                  assert.equal(tokenUri, HAPPY_TOKEN_URI);
              });

              it("Returns a Sad face NFT is the current price is lower than the threshold", async () => {
                  const { answer } = await aggregatorV3.latestRoundData();
                  const priceOffset = 1;
                  const priceThreshold = answer.add(priceOffset).toString();
                  console.log({ pricefeed: answer.toString(), limit: priceThreshold });
                  const mint = await svgHiosToken.mint(priceThreshold);
                  await mint.wait(1);
                  const tokenUri = await svgHiosToken.tokenURI(1);
                  assert.equal(tokenUri, SAD_TOKEN_URI);
              });
          });
      });
