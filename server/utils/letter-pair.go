package utils

var validMnemonicKeys = []string{
	"owner",
	"speffz_pair",
	"words",
	"image",
	"sm2_n",
	"sm2_ef",
	"sm2_i",
	"last_review_at",
	"next_review_at",
}

func MakePartialMnemonic(partialMnemonic map[string]any) (map[string]any, string) {
	validMnemonic := map[string]any{}
	speffzPair := ""
	for _, k := range validMnemonicKeys {
		v, ok := partialMnemonic[k]
		if ok {
			validMnemonic[k] = v
			if k == "speffz_pair" {
				switch vv := v.(type) {
				case string:
					{
						speffzPair = vv
					}
				}
			}
		}
	}

	return validMnemonic, speffzPair
}
